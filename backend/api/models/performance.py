"""
FastAPI application for a model performance dashboard.

This module provides endpoints for retrieving model performance metrics
and visualizations from a JSON file.
"""

import json
import os
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator


app = FastAPI(title="Model Performance Dashboard API")

# Path to the JSON file
JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), "test_report.json")


class Metric(BaseModel):
    """
    Represents a performance metric.

    Attributes
    ----------
    name : str
        The name of the metric.
    type : str
        The type of the metric (e.g., BinaryAccuracy).
    slice : str
        The data slice this metric applies to.
    tooltip : str
        A brief description of the metric.
    value : float
        The current value of the metric.
    threshold : float
        The threshold value for the metric.
    passed : bool
        Whether the metric passed the threshold.
    history : List[float]
        Historical values of the metric.
    timestamps : List[str]
        Timestamps corresponding to the historical values.
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

    @validator("value", "threshold")
    def check_range(cls, v):
        if not 0 <= v <= 1:
            raise ValueError("Value must be between 0 and 1")
        return v


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
        List of value ranges for slices.
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
    Represents an overview of the performance metrics.

    Attributes
    ----------
    last_n_evals : int
        Number of last evaluations considered.
    mean_std_min_evals : int
        Minimum number of evaluations for mean and std calculation.
    metric_cards : MetricCards
        Collection of metric cards.
    """

    last_n_evals: int = Field(..., ge=1)
    mean_std_min_evals: int = Field(..., ge=1)
    metric_cards: MetricCards


class PerformanceData(BaseModel):
    """
    Represents the overall performance data.

    Attributes
    ----------
    overview : Overview
        Overview of the performance metrics.
    """

    overview: Overview


def load_json_data() -> dict:
    """
    Load data from the JSON file.

    Returns
    -------
    dict
        The loaded JSON data.

    Raises
    ------
    HTTPException
        If the file is not found or there's an error in reading the file.
    """
    try:
        with open(JSON_FILE_PATH, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="JSON file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding JSON file")


@app.get("/performance_metrics", response_model=PerformanceData)
async def get_performance_metrics():
    """
    Retrieve performance metrics data.

    Returns
    -------
    PerformanceData
        The performance metrics data.

    Raises
    ------
    HTTPException
        If there's an error in processing the data.
    """
    try:
        data = load_json_data()
        # Ensure 'values' is a list of strings
        data["overview"]["metric_cards"]["values"] = [
            str(v) for v in data["overview"]["metric_cards"]["values"]
        ]
        return PerformanceData(**data)
    except KeyError as e:
        raise HTTPException(
            status_code=500, detail=f"Missing key in JSON data: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.get("/metrics/{metric_name}", response_model=List[Metric])
async def get_metric_details(metric_name: str):
    """
    Retrieve details for a specific metric across all slices.

    Parameters
    ----------
    metric_name : str
        The name of the metric to retrieve.

    Returns
    -------
    List[Metric]
        A list of Metric objects for the specified metric name.

    Raises
    ------
    HTTPException
        If the metric is not found or there's an error in processing the data.
    """
    try:
        data = load_json_data()
        metrics = [
            metric
            for metric in data["overview"]["metric_cards"]["collection"]
            if metric["name"] == metric_name
        ]
        if not metrics:
            raise HTTPException(
                status_code=404, detail=f"Metric '{metric_name}' not found"
            )
        return [Metric(**metric) for metric in metrics]
    except KeyError as e:
        raise HTTPException(
            status_code=500, detail=f"Missing key in JSON data: {str(e)}"
        )


@app.get("/slices/{slice_name}", response_model=List[Metric])
async def get_slice_details(slice_name: str):
    """
    Retrieve details for a specific slice across all metrics.

    Parameters
    ----------
    slice_name : str
        The name of the slice to retrieve.

    Returns
    -------
    List[Metric]
        A list of Metric objects for the specified slice name.

    Raises
    ------
    HTTPException
        If the slice is not found or there's an error in processing the data.
    """
    try:
        data = load_json_data()
        metrics = [
            metric
            for metric in data["overview"]["metric_cards"]["collection"]
            if metric["slice"] == slice_name
        ]
        if not metrics:
            raise HTTPException(
                status_code=404, detail=f"Slice '{slice_name}' not found"
            )
        return [Metric(**metric) for metric in metrics]
    except KeyError as e:
        raise HTTPException(
            status_code=500, detail=f"Missing key in JSON data: {str(e)}"
        )
