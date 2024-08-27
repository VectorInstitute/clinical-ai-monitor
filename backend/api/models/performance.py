"""Performance metrics module for evaluation endpoints."""

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple, TypedDict, cast

from fastapi import HTTPException

from api.models.constants import METRIC_DISPLAY_NAMES, METRIC_TOOLTIPS
from api.models.data import Metric, MetricCards, Overview, PerformanceData


DATA_DIR = Path("endpoint_data")


def load_json_file(file_path: Path) -> Dict[str, Any]:
    """
    Load and parse a JSON file.

    Parameters
    ----------
    file_path : Path
        The path to the JSON file.

    Returns
    -------
    Dict[str, Any]
        The parsed JSON data.

    Raises
    ------
    HTTPException
        If there's an error reading or parsing the file.
    """
    try:
        with open(file_path, "r") as f:
            return cast(Dict[str, Any], json.load(f))
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, detail=f"Error decoding JSON file: {e}"
        ) from e
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {e}") from e


def format_metric_name(metric: str) -> Tuple[str, str]:
    """
    Format the metric name for display while keeping the original name for data.

    Parameters
    ----------
    metric : str
        The original metric name.

    Returns
    -------
    Tuple[str, str]
        A tuple containing (original_name, display_name).
    """
    display_name = METRIC_DISPLAY_NAMES.get(metric, metric.replace("_", " ").title())
    return (metric, display_name)


def create_metric(
    metric: str,
    slice_: str,
    evaluation_history: List[Dict[str, Any]],
    threshold: float = 0.6,
) -> Metric:
    """
    Create a Metric object from evaluation history.

    Parameters
    ----------
    metric : str
        The name of the metric.
    slice_ : str
        The name of the slice.
    evaluation_history : List[Dict[str, Any]]
        The evaluation history data.
    threshold : float, optional
        The threshold value for the metric, by default 0.6.

    Returns
    -------
    Metric
        A Metric object containing the metric data.
    """
    history: List[float] = []
    timestamps: List[str] = []
    sample_sizes: List[int] = []

    for eval_result in evaluation_history:
        value = (
            eval_result["evaluation_result"]["model_for_preds_prob"]
            .get(slice_, {})
            .get(metric, 0.0)
        )
        history.append(value)
        timestamps.append(eval_result["timestamp"])
        sample_sizes.append(eval_result["sample_size"])

    latest_value = history[-1] if history else 0.0
    original_name, display_name = format_metric_name(metric)
    passed = latest_value >= threshold
    status = "met" if passed else "not met"
    return Metric(
        name=original_name,
        display_name=display_name,
        type=metric.split("_")[0],
        slice=slice_,
        tooltip=METRIC_TOOLTIPS.get(metric, f"No tooltip available for {metric}"),
        value=latest_value,
        threshold=threshold,
        passed=passed,
        status=status,
        history=history,
        timestamps=timestamps,
        sample_sizes=sample_sizes,
    )


class PerformanceDataDict(TypedDict):
    """Performance data dictionary.

    Attributes
    ----------
    overview : Dict[str, Any]
        Overview of performance metrics.
    """

    overview: Dict[str, Any]


async def get_performance_metrics(
    endpoint_name: str,
    model_id: str,
) -> PerformanceDataDict:
    """
    Retrieve performance metrics for a specific endpoint from the JSON file.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to get performance metrics for.
    model_id : str
        The ID of the model for which the performance metrics are to be retrieved.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the performance metrics data.

    Raises
    ------
    HTTPException
        If the endpoint file is not found.
    """
    threshold = 0.6
    mean_std_min_evals = 3
    file_path = DATA_DIR / f"{endpoint_name}.json"

    if not file_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Evaluation endpoint '{endpoint_name}' not found"
        )

    data = load_json_file(file_path)
    evaluation_history: List[Dict[str, Any]] = data.get("evaluation_history", {}).get(
        model_id, []
    )
    last_n_evals = len(evaluation_history)
    has_data = bool(evaluation_history)

    if has_data:
        latest_evaluation = evaluation_history[-1]
        metrics: List[str] = latest_evaluation["metrics"]
        slices: List[str] = latest_evaluation["subgroups"]
        formatted_metrics: List[Tuple[str, str]] = [
            format_metric_name(metric) for metric in metrics
        ]
        metric_cards = MetricCards(
            metrics=[original for original, _ in formatted_metrics],
            display_names=[display for _, display in formatted_metrics],
            tooltips=[
                METRIC_TOOLTIPS.get(metric, f"No tooltip available for {metric}")
                for metric in metrics
            ],
            slices=slices,
            collection=[
                create_metric(metric, slice_, evaluation_history, threshold)
                for metric in metrics
                for slice_ in slices
            ],
        )
    else:
        metric_cards = MetricCards(
            metrics=[],
            display_names=[],
            tooltips=[],
            slices=[],
            collection=[],
        )

    overview = Overview(
        last_n_evals=last_n_evals,
        mean_std_min_evals=mean_std_min_evals,
        metric_cards=metric_cards,
        has_data=has_data,
    )

    performance_data = PerformanceData(overview=overview)
    return cast(PerformanceDataDict, performance_data.dict())
