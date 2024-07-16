"""Performance metrics module for evaluation endpoints."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, cast

from fastapi import HTTPException
from pydantic import BaseModel, Field


DATA_DIR = Path("evaluation_data")


class Metric(BaseModel):
    """
    Represents a single metric with its associated data.

    Attributes
    ----------
    name : str
        The name of the metric.
    type : str
        The type of the metric.
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
    threshold: Optional[float] = Field(default=0.6)
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
        Minimum number of evaluations for mean and standard deviation.
    metric_cards : MetricCards
        Collection of metric cards.
    """

    last_n_evals: int
    mean_std_min_evals: int
    metric_cards: MetricCards


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


def create_metric(
    metric: str, slice_: str, evaluation_history: List[Dict[str, Any]]
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
            eval_result.get("evaluation_result", {})
            .get("model_for_preds_prob", {})
            .get(slice_, {})
            .get(metric, 0.0)
        )
        history.append(value)
        timestamps.append(eval_result.get("timestamp", ""))
        sample_sizes.append(eval_result.get("sample_size", 0))

    latest_value = history[-1] if history else 0.0
    threshold = 0.6  # You may want to make this configurable or fetch from a config
    return Metric(
        name=metric,
        type=metric.split("_")[0],  # Assuming format like "binary_accuracy"
        slice=slice_,
        tooltip=f"{metric} for {slice_}",
        value=latest_value,
        threshold=threshold,
        passed=latest_value >= threshold,
        history=history,
        timestamps=timestamps,
        sample_sizes=sample_sizes,
    )


async def get_performance_metrics(model_id: str) -> Dict[str, Any]:
    """
    Retrieve performance metrics for a specific model from the JSON file.

    Parameters
    ----------
    model_id : str
        The ID of the model to get performance metrics for.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the performance metrics data.

    Raises
    ------
    HTTPException
        If the file is not found or there's an error processing the data.
    """
    file_path = DATA_DIR / f"model_{model_id}.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")

    try:
        data = load_json_file(file_path)
    except HTTPException as e:
        raise HTTPException(
            status_code=500, detail=f"Error loading model data: {str(e)}"
        ) from e

    evaluation_history = data.get("evaluation_history", {})

    if not evaluation_history:
        raise HTTPException(
            status_code=404,
            detail=f"No evaluation history for model '{model_id}'",
        )

    # Get the first endpoint_id (assuming there's at least one)
    first_endpoint_id = next(iter(evaluation_history.keys()), None)
    if not first_endpoint_id:
        raise HTTPException(
            status_code=404,
            detail=f"No endpoint data found for model '{model_id}'",
        )

    endpoint_history = evaluation_history[first_endpoint_id]
    if not endpoint_history:
        raise HTTPException(
            status_code=404,
            detail=f"Empty evaluation history for model '{model_id}' and endpoint '{first_endpoint_id}'",
        )

    latest_evaluation = endpoint_history[-1]
    metrics: List[str] = latest_evaluation.get("metrics", [])
    slices: List[str] = latest_evaluation.get("subgroups", [])

    if not metrics or not slices:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid evaluation data structure for model '{model_id}'",
        )

    try:
        metric_cards = MetricCards(
            metrics=metrics,
            tooltips=[f"Tooltip for {metric}" for metric in metrics],
            slices=slices,
            collection=[
                create_metric(metric, slice_, endpoint_history)
                for metric in metrics
                for slice_ in slices
            ],
        )

        overview = Overview(
            last_n_evals=10,
            mean_std_min_evals=3,
            metric_cards=metric_cards,
        )

        performance_data = PerformanceData(overview=overview)
        return performance_data.dict()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing performance metrics: {str(e)}",
        ) from e
