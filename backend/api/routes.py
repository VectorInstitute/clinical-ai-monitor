"""Backend API routes."""

from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.api.models.configure import (
    create_evaluation_endpoint,
    delete_evaluation_endpoint,
    evaluate_model,
    list_evaluation_endpoints,
)
from backend.api.models.evaluate import (
    EndpointConfig,
    EvaluationInput,
    EvaluationResult,
)
from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


router = APIRouter()


class EndpointLog(BaseModel):
    """
    Evaluation endpoint log model.

    Parameters
    ----------
    id : str
        Unique identifier for the endpoint log.
    endpoint_name : str
        Name of the evaluation endpoint.
    created_at : datetime
        Timestamp when the endpoint was created.
    last_evaluated : datetime
        Timestamp of the last evaluation.
    evaluation_count : int
        Number of evaluations performed.
    """

    id: str
    endpoint_name: str
    created_at: datetime
    last_evaluated: datetime
    evaluation_count: int


@router.get("/endpoint_logs", response_model=List[EndpointLog])
async def get_endpoint_logs() -> List[EndpointLog]:
    """
    Get evaluation endpoint logs.

    Returns
    -------
    List[EndpointLog]
        A list of evaluation endpoint logs.
    """
    return [
        EndpointLog(
            id="1",
            endpoint_name="Endpoint1",
            created_at=datetime.now(),
            last_evaluated=datetime.now(),
            evaluation_count=10,
        ),
        EndpointLog(
            id="2",
            endpoint_name="Endpoint2",
            created_at=datetime.now(),
            last_evaluated=datetime.now(),
            evaluation_count=5,
        ),
    ]


@router.post("/create_evaluation_endpoint", response_model=Dict[str, str])
async def create_endpoint(config: EndpointConfig) -> Dict[str, str]:
    """
    Create a new evaluation endpoint.

    Parameters
    ----------
    config : EndpointConfig
        The configuration for the new evaluation endpoint.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If there's an error creating the evaluation endpoint.
    """
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
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[Dict[str, str]]]
        A dictionary containing a list of endpoint details.
    """
    return list_evaluation_endpoints()


@router.post("/evaluate/{endpoint_name}", response_model=EvaluationResult)
async def evaluate(endpoint_name: str, data: EvaluationInput) -> EvaluationResult:
    """
    Evaluate a model using the specified evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to use.
    data : EvaluationInput
        The input data for evaluation.

    Returns
    -------
    EvaluationResult
        The evaluation results.

    Raises
    ------
    HTTPException
        If the specified endpoint does not exist or there's an error during evaluation.
    """
    try:
        return evaluate_model(endpoint_name, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/performance_metrics/{endpoint_name}", response_model=Dict[str, Any])
async def get_performance_metrics_for_endpoint(endpoint_name: str) -> Dict[str, Any]:
    """
    Retrieve performance metrics for the model.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint.

    Returns
    -------
    Dict[str, Any]
        Dict containing performance metrics.

    Raises
    ------
    HTTPException
        If there's an error retrieving performance metrics.
    """
    try:
        return await get_performance_metrics(endpoint_name)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving performance metrics: {str(e)}"
        ) from e


@router.get("/model/{model_id}/health", response_model=ModelHealth)
async def get_model_health_status(model_id: str) -> ModelHealth:
    """
    Retrieve health information for a specific model.

    Parameters
    ----------
    model_id : str
        The unique identifier of the model.

    Returns
    -------
    ModelHealth
        ModelHealth object containing model health information.

    Raises
    ------
    HTTPException
        If there's an error retrieving model health.
    """
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
    """
    Delete an existing evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If there's an error deleting the evaluation endpoint.
    """
    try:
        return delete_evaluation_endpoint(endpoint_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e
