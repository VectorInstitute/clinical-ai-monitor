"""Performance metrics backend endpoint."""

import random
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


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
    threshold: float
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
    values : List[str]
        List of value ranges.
    collection : List[Metric]
        Collection of individual metrics.
    """

    metrics: List[str]
    tooltips: List[str]
    slices: List[str]
    values: List[str]
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


def generate_random_history(n: int = 30) -> List[float]:
    """
    Generate a list of random float values.

    Parameters
    ----------
    n : int, optional
        Number of values to generate (default is 30).

    Returns
    -------
    List[float]
        List of random float values between 0.8 and 0.9.
    """
    return [round(random.uniform(0.8, 0.9), 2) for _ in range(n)]


def generate_timestamps(n: int = 30) -> List[str]:
    """
    Generate a list of timestamps for the last n days.

    Parameters
    ----------
    n : int, optional
        Number of days to generate timestamps for (default is 30).

    Returns
    -------
    List[str]
        List of timestamps in 'YYYY-MM-DD' format.
    """
    return [
        (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(n - 1, -1, -1)
    ]


def generate_sample_sizes(n: int = 30) -> List[int]:
    """
    Generate a list of random sample sizes.

    Parameters
    ----------
    n : int, optional
        Number of sample sizes to generate (default is 30).

    Returns
    -------
    List[int]
        List of random sample sizes between 100 and 1000.
    """
    return [random.randint(100, 1000) for _ in range(n)]


def create_metric(
    name: str, metric_type: str, slice_: str, tooltip: str, threshold: float = 0.6
) -> Metric:
    """
    Create a Metric object with generated history, timestamps, and sample sizes.

    Parameters
    ----------
    name : str
        The name of the metric.
    metric_type : str
        The type of the metric.
    slice_ : str
        The slice or segment of data the metric represents.
    tooltip : str
        A brief description or explanation of the metric.
    threshold : float, optional
        The threshold value for the metric (default is 0.6).

    Returns
    -------
    Metric
        A Metric object with generated data.
    """
    history = generate_random_history()
    value = history[-1]
    return Metric(
        name=name,
        type=metric_type,
        slice=slice_,
        tooltip=tooltip,
        value=value,
        threshold=threshold,
        passed=value >= threshold,
        history=history,
        timestamps=generate_timestamps(),
        sample_sizes=generate_sample_sizes(),  # Add this line
    )


@app.get("/api/performance_metrics", response_model=PerformanceData)
async def get_performance_metrics() -> PerformanceData:
    """
    Generate and return performance metrics data.

    Returns
    -------
    PerformanceData
        An object containing overview and metric data.
    """
    metrics = ["Accuracy", "Precision", "Recall", "F1 Score"]
    tooltips = [
        "The proportion of all instances that are correctly predicted.",
        "The proportion of predicted positive instances that are correctly predicted.",
        "The proportion of actual positive instances that are correctly predicted.",
        "The harmonic mean of precision and recall.",
    ]
    slices = ["Age:[30 - 50)", "Age:[50 - 70)", "overall"]

    collection = [
        create_metric(
            name=metric,
            metric_type=f"Binary{metric.replace(' ', '')}",
            slice_=slice_,
            tooltip=tooltips[metrics.index(metric)],
        )
        for metric in metrics
        for slice_ in slices
    ]

    return PerformanceData(
        overview=Overview(
            last_n_evals=10,
            mean_std_min_evals=3,
            metric_cards=MetricCards(
                metrics=metrics,
                tooltips=tooltips,
                slices=slices,
                values=["[30 - 50)", "[50 - 70)"],
                collection=collection,
            ),
        )
    )
