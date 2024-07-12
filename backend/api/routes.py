"""Backend API routes."""

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from backend.api.models.config import EndpointConfig
from backend.api.models.evaluate import (
    EndpointLog,
    EvaluationInput,
    create_evaluation_endpoint,
    delete_evaluation_endpoint,
    evaluate_model,
    get_endpoint_logs,
    list_evaluation_endpoints,
)
from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


router = APIRouter()


@router.post("/create_evaluation_endpoint", response_model=Dict[str, str])
async def create_endpoint(config: EndpointConfig) -> Dict[str, str]:
    """Create a new evaluation endpoint."""
    try:
        return create_evaluation_endpoint(config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/evaluation_endpoints", response_model=Dict[str, List[Dict[str, str]]])
async def get_evaluation_endpoints() -> Dict[str, List[Dict[str, str]]]:
    """List all created evaluation endpoints."""
    return list_evaluation_endpoints()


@router.post("/evaluate/{endpoint_name}", response_model=Dict[str, Any])
async def evaluate(endpoint_name: str, data: EvaluationInput) -> Dict[str, Any]:
    """Evaluate a model using the specified evaluation endpoint configuration."""
    try:
        return evaluate_model(endpoint_name, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/endpoint_logs/{endpoint_name}", response_model=List[EndpointLog])
async def endpoint_logs(endpoint_name: str) -> List[EndpointLog]:
    """Get logs for a specific endpoint."""
    try:
        return get_endpoint_logs(endpoint_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/performance_metrics/{endpoint_name}", response_model=Dict[str, Any])
async def get_performance_metrics_for_endpoint(endpoint_name: str) -> Dict[str, Any]:
    """Retrieve performance metrics for the model."""
    try:
        return await get_performance_metrics(endpoint_name)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving performance metrics: {str(e)}"
        ) from e


@router.get("/model/{model_id}/health", response_model=ModelHealth)
async def get_model_health_status(model_id: str) -> ModelHealth:
    """Retrieve health information for a specific model."""
    try:
        return await get_model_health(model_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        ) from e


@router.delete(
    "/delete_evaluation_endpoint/{endpoint_name}", response_model=Dict[str, str]
)
async def delete_endpoint(endpoint_name: str) -> Dict[str, str]:
    """Delete an existing evaluation endpoint configuration."""
    try:
        return delete_evaluation_endpoint(endpoint_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e
