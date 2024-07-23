"""Performance metrics module for evaluation endpoints."""

import json
from pathlib import Path
from typing import Any, Dict, List, cast

from fastapi import HTTPException
from pydantic import BaseModel, Field

from api.models.constants import METRIC_DISPLAY_NAMES, METRIC_TOOLTIPS


DATA_DIR = Path("endpoint_data")


class Metric(BaseModel):
    """
    Represents a single metric with its associated data.

    Attributes
    ----------
    name : str
        The name of the metric.
    type : str
        The type of the metric (binary or multiclass).
    slice : str
        The slice or segment of data the metric represents.
    tooltip : str
        A brief description or explanation of the metric.
    value : float
        The current value of the metric.
    threshold : float
        The threshold value for the metric.
    passed : bool
        Indicates whether the metric passed the threshold.
    history : List[float]
        Historical values of the metric.
    timestamps : List[str]
        Timestamps corresponding to the historical values.
    sample_sizes : List[int]
        Sample sizes corresponding to the historical values.
    """

    name: str
    type: str
    slice: str
    tooltip: str
    value: float
    threshold: float = Field(default=0.6)
    passed: bool
    history: List[float]
    timestamps: List[str]
    sample_sizes: List[int]


class MetricCards(BaseModel):
    """
    Represents a collection of metric cards.

    Attributes
    ----------
    metrics : List[str]
        List of metric names.
    tooltips : List[str]
        List of tooltips for each metric.
    slices : List[str]
        List of data slices.
    collection : List[Metric]
        Collection of individual metrics.
    """

    metrics: List[str]
    tooltips: List[str]
    slices: List[str]
    collection: List[Metric]


class Overview(BaseModel):
    """
    Represents an overview of performance metrics.

    Attributes
    ----------
    last_n_evals : int
        Number of recent evaluations.
    mean_std_min_evals : int
        Minimum number of evaluations required to calculate mean and standard deviation.
    metric_cards : MetricCards
        Collection of metric cards.
    has_data : bool
        Indicates whether there is evaluation data available.
    """

    last_n_evals: int
    mean_std_min_evals: int
    metric_cards: MetricCards
    has_data: bool


class PerformanceData(BaseModel):
    """
    Represents the overall performance data.

    Attributes
    ----------
    overview : Overview
        Overview of performance metrics.
    """

    overview: Overview


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


def format_metric_name(metric: str) -> str:
    """
    Format the metric name for display.

    Parameters
    ----------
    metric : str
        The original metric name.

    Returns
    -------
    str
        The formatted metric name for display.
    """
    return str(METRIC_DISPLAY_NAMES.get(metric, metric.replace("_", " ").title()))


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

    return Metric(
        name=format_metric_name(metric),
        type=metric.split("_")[0],
        slice=slice_,
        tooltip=METRIC_TOOLTIPS.get(metric, f"No tooltip available for {metric}"),
        value=latest_value,
        threshold=threshold,
        passed=latest_value >= threshold,
        history=history,
        timestamps=timestamps,
        sample_sizes=sample_sizes,
    )


async def get_performance_metrics(
    endpoint_name: str,
) -> Dict[str, Any]:
    """
    Retrieve performance metrics for a specific endpoint from the JSON file.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to get performance metrics for.

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
    last_n_evals = 10
    mean_std_min_evals = 3
    file_path = DATA_DIR / f"{endpoint_name}.json"

    if not file_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Evaluation endpoint '{endpoint_name}' not found"
        )

    data = load_json_file(file_path)
    evaluation_history: List[Dict[str, Any]] = data.get("evaluation_history", [])

    has_data = bool(evaluation_history)

    if has_data:
        latest_evaluation = evaluation_history[-1]
        metrics: List[str] = latest_evaluation["metrics"]
        slices: List[str] = latest_evaluation["subgroups"]

        metric_cards = MetricCards(
            metrics=[format_metric_name(metric) for metric in metrics],
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
    return performance_data.dict()
