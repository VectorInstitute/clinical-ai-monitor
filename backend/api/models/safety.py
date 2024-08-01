"""Model safety API."""

from datetime import datetime, timedelta
from typing import List

from fastapi import HTTPException
from pydantic import BaseModel


class Metric(BaseModel):
    """
    Represents a single safety metric for a model.

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


class ModelSafety(BaseModel):
    """
    Represents the safety of a model.

    Attributes
    ----------
    metrics : List[Metric]
        A list of individual metrics and their current status.
    last_evaluated : datetime
        A timestamp of when the model was last evaluated.
    overall_status : str
        The overall status of the model ('No warnings' or 'Warning').
    """

    metrics: List[Metric]
    last_evaluated: datetime
    overall_status: str


async def get_model_safety(model_id: str) -> ModelSafety:
    """
    Retrieve the safety data for a specific model.

    Parameters
    ----------
    model_id : str
        The unique identifier of the model.

    Returns
    -------
    ModelSafety
        An object containing the overall safety status, last evaluated date,
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
        last_evaluated: datetime = current_date - timedelta(days=32)

        # Simulate individual metrics
        metrics: List[Metric] = [
            Metric(name="Accuracy", value=92, unit="%", status="met"),
            Metric(name="F1 Score", value=0.88, unit="", status="met"),
            Metric(name="AUC-ROC", value=0.95, unit="", status="met"),
        ]

        # Compute overall status
        all_criteria_met = all(metric.status == "met" for metric in metrics)
        is_recently_evaluated = (current_date - last_evaluated).days <= 30
        overall_status = (
            "No warnings" if all_criteria_met and is_recently_evaluated else "Warning"
        )

        return ModelSafety(
            metrics=metrics,
            last_evaluated=last_evaluated,
            overall_status=overall_status,
        )
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve)) from ve
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model safety: {str(e)}"
        ) from e
