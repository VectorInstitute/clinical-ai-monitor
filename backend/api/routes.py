"""Routes."""

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


# Create a router instance
router: APIRouter = APIRouter()

# Set up logging
logger: logging.Logger = logging.getLogger("uvicorn.error")


@router.get("/performance_metrics", response_model=Dict[str, Any])
async def performance_metrics() -> Dict[str, Any]:
    """Retrieve performance metrics for the model.

    Returns
    -------
    Dict[str, Any]
        Dict containing performance metrics

    """
    try:
        return await get_performance_metrics()
    except Exception as e:
        logger.error("Error retrieving performance metrics: %s", str(e))
        raise HTTPException(
            status_code=500, detail="Error retrieving performance metrics"
        ) from e


@router.get("/model/{model_id}/health", response_model=ModelHealth)
async def model_health(model_id: str) -> ModelHealth:
    """
    Retrieve health information for a specific model.

    Parameters
    ----------
    model_id: str
        The unique identifier of the model

    Returns
    -------
    ModelHealth
        ModelHealth object containing model health information

    """
    try:
        return await get_model_health(model_id)
    except HTTPException:
        # Re-raise HTTP exceptions from the model function
        raise
    except Exception as e:
        logger.error("Error retrieving model health: %s", str(e))
        raise HTTPException(
            status_code=500, detail="Error retrieving model health"
        ) from e
