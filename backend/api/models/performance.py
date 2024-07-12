"""Performance metrics module for evaluation endpoints."""

import json
from pathlib import Path
from typing import Any, Dict, List

from fastapi import HTTPException
from pydantic import BaseModel


DATA_DIR = Path("endpoint_data")


class Metric(BaseModel):
    """Represents a single metric with its associated data."""

    name: str
    type: str
    slice: str
    tooltip: str
    value: float
    threshold: float
    passed: bool
    history: List[float]
    timestamps: List[str]
    sample_sizes: List[int]


class MetricCards(BaseModel):
    """Represents a collection of metric cards."""

    metrics: List[str]
    tooltips: List[str]
    slices: List[str]
    values: List[str]
    collection: List[Metric]


class Overview(BaseModel):
    """Represents an overview of performance metrics."""

    last_n_evals: int
    mean_std_min_evals: int
    metric_cards: MetricCards


class PerformanceData(BaseModel):
    """Represents the overall performance data."""

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
            return json.load(f)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, detail=f"Error decoding JSON file: {e}"
        ) from e
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {e}") from e


def create_metric(
    metric: str, slice_: str, evaluation_result: Dict[str, Any]
) -> Metric:
    """
    Create a Metric object from evaluation data.

    Parameters
    ----------
    metric : str
        The name of the metric.
    slice_ : str
        The name of the slice.
    evaluation_result : Dict[str, Any]
        The evaluation result data.

    Returns
    -------
    Metric
        A Metric object containing the metric data.
    """
    value = evaluation_result.get(f"{slice_}/{metric}", 0.0)
    return Metric(
        name=metric,
        type=metric,
        slice=slice_,
        tooltip=f"{metric} for {slice_}",
        value=value,
        threshold=0.6,  # You may want to make this configurable
        passed=value >= 0.6,
        history=[value],
        timestamps=[evaluation_result.get("timestamp", "")],
        sample_sizes=[evaluation_result.get("sample_size", 0)],
    )


async def get_performance_metrics(endpoint_name: str) -> PerformanceData:
    """
    Retrieve performance metrics for a specific endpoint from the JSON file.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to get performance metrics for.

    Returns
    -------
    PerformanceData
        A PerformanceData object containing the performance metrics data.

    Raises
    ------
    HTTPException
        If the endpoint file is not found or there's an error processing the data.
    """
    file_path = DATA_DIR / f"{endpoint_name}.json"

    if not file_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Evaluation endpoint '{endpoint_name}' not found"
        )

    data = load_json_file(file_path)
    evaluation_history = data.get("evaluation_history", [])

    if not evaluation_history:
        raise HTTPException(
            status_code=404,
            detail=f"No evaluation history for endpoint '{endpoint_name}'",
        )

    latest_evaluation = evaluation_history[-1]
    metrics = latest_evaluation["metrics"]
    slices = latest_evaluation["subgroups"] + ["overall"]

    metric_cards = MetricCards(
        metrics=metrics,
        tooltips=[f"Tooltip for {metric}" for metric in metrics],
        slices=slices,
        values=[f"[{i*10} - {(i+1)*10})" for i in range(10)],
        collection=[
            create_metric(metric, slice_, latest_evaluation["evaluation_result"])
            for metric in metrics
            for slice_ in slices
        ],
    )

    overview = Overview(
        last_n_evals=len(evaluation_history),
        mean_std_min_evals=3,
        metric_cards=metric_cards,
    )

    return PerformanceData(overview=overview)
