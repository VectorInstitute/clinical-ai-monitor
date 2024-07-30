"""Model health API."""

from datetime import datetime, timedelta
from typing import List

from fastapi import HTTPException
from pydantic import BaseModel


class Metric(BaseModel):
    """
    Represents a single health metric for a model.

    Attributes
    ----------
    name : str
        The name of the metric.
    value : float
        The current value of the metric.
    unit : str
        The unit of measurement for the metric.
    status : str
        Whether the metric is 'met' or 'not met'.
    """

    name: str
    value: float
    unit: str
    status: str


class ModelHealth(BaseModel):
    """
    Represents the health of a model.

    Attributes
    ----------
    metrics : List[Metric]
        A list of individual metrics and their current status.
    last_evaluated : datetime
        A timestamp of when the model was last evaluated.
    """

    metrics: List[Metric]
    last_evaluated: datetime


async def get_model_health(model_id: str) -> ModelHealth:
    """
    Retrieve the health data for a specific model.

    Parameters
    ----------
    model_id : str
        The unique identifier of the model.

    Returns
    -------
    ModelHealth
        An object containing the overall health over time, time points,
        and individual metrics.

    Raises
    ------
    HTTPException
        If the model_id is not found or if there's an error retrieving
        the data.
    """
    try:
        # Simulate fetching data from a database
        current_date: datetime = datetime.now()
        last_evaluated: datetime = current_date - timedelta(
            days=30
        )  # Simulating last evaluation 5 days ago

        # Simulate individual metrics
        metrics: List[Metric] = [
            Metric(name="Accuracy", value=92, unit="%", status="met"),
            Metric(name="F1 Score", value=0.88, unit="", status="met"),
            Metric(name="AUC-ROC", value=0.95, unit="", status="unmet"),
        ]

        return ModelHealth(metrics=metrics, last_evaluated=last_evaluated)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        ) from e
