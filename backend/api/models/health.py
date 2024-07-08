from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter()


class ModelHealth(BaseModel):
    model_health: float
    health_over_time: List[float]
    time_points: List[str]


@router.get("/model/health", response_model=ModelHealth)
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
        An object containing the current model health, health over time, and corresponding time points.

    Raises
    ------
    HTTPException
        If the model_id is not found or if there's an error retrieving the data.
    """
    try:
        # Simulate fetching data from a database
        health_data = [65, 25, 80, 75, 85, 90, 85]
        current_date = datetime.now()
        time_points = [
            (current_date - timedelta(weeks=6 - i)).strftime("%Y-%m-%d")
            for i in range(7)
        ]

        return ModelHealth(
            model_health=health_data[-1],
            health_over_time=health_data,
            time_points=time_points,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        )
