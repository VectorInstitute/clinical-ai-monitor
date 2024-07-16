"""Backend API routes."""

from typing import Any, Dict, List
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from backend.api.models.config import EndpointConfig, ModelConfig
from backend.api.models.evaluate import (
    EndpointDetails,
    EndpointLog,
    EvaluationInput,
    associate_model_to_endpoint,
    create_evaluation_endpoint,
    delete_evaluation_endpoint,
    evaluate_model,
    get_endpoint_logs,
    list_evaluation_endpoints,
    list_models,
)
from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


router = APIRouter(prefix="/api/v1")


@router.post("/endpoints", response_model=Dict[str, str])
async def create_endpoint(config: EndpointConfig) -> Dict[str, str]:
    """
    Create a new evaluation endpoint.

    Parameters
    ----------
    config : EndpointConfig
        The configuration for the new endpoint.

    Returns
    -------
    Dict[str, str]
        A dictionary containing the result of the endpoint creation.

    Raises
    ------
    HTTPException
        If there's an error during endpoint creation.
    """
    try:
        endpoint_id = str(uuid4())
        result = create_evaluation_endpoint(endpoint_id, config)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return {"endpoint_id": endpoint_id, "message": "Endpoint created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/endpoints", response_model=Dict[str, List[EndpointDetails]])
async def get_endpoints() -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of all evaluation endpoints.
    """
    return list_evaluation_endpoints()


@router.get("/endpoints/{endpoint_id}", response_model=EndpointDetails)
async def get_endpoint(endpoint_id: str) -> EndpointDetails:
    """
    Get details for a specific endpoint.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to retrieve details for.

    Returns
    -------
    EndpointDetails
        The details of the specified endpoint.

    Raises
    ------
    HTTPException
        If there's an error retrieving the endpoint details.
    """
    try:
        endpoints = list_evaluation_endpoints()
        for endpoint in endpoints.get("endpoints", []):
            if endpoint["endpoint_id"] == endpoint_id:
                return endpoint
        raise ValueError(f"Endpoint with ID {endpoint_id} not found")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.delete("/endpoints/{endpoint_id}", response_model=Dict[str, str])
async def delete_endpoint(endpoint_id: str) -> Dict[str, str]:
    """
    Delete an existing evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing the result of the endpoint deletion.

    Raises
    ------
    HTTPException
        If there's an error during endpoint deletion.
    """
    try:
        return delete_evaluation_endpoint(endpoint_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/endpoints/{endpoint_id}/logs", response_model=List[EndpointLog])
async def retrieve_endpoint_logs(endpoint_id: str) -> List[EndpointLog]:
    """
    Get logs for a specific endpoint.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to retrieve logs for.

    Returns
    -------
    List[EndpointLog]
        A list of logs for the specified endpoint.

    Raises
    ------
    HTTPException
        If there's an error retrieving the logs.
    """
    try:
        return get_endpoint_logs(endpoint_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.post("/endpoints/{endpoint_id}/models", response_model=Dict[str, str])
async def add_model_to_endpoint(endpoint_id: str, model: ModelConfig) -> Dict[str, str]:
    """
    Associate a new model with an existing endpoint.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to associate the model with.
    model : ModelConfig
        The configuration for the new model.

    Returns
    -------
    Dict[str, str]
        A dictionary containing the result of the model association.

    Raises
    ------
    HTTPException
        If there's an error during model association.
    """
    try:
        model_id = str(uuid4())
        result = associate_model_to_endpoint(endpoint_id, model_id, model)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return {"model_id": model_id, "message": "Model associated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/models", response_model=Dict[str, List[Dict[str, Any]]])
async def get_models() -> Dict[str, List[Dict[str, Any]]]:
    """
    List all models across all endpoints.

    Returns
    -------
    Dict[str, List[Dict[str, Any]]]
        A dictionary containing a list of all models.
    """
    return list_models()


@router.post("/models/{model_id}/evaluate", response_model=Dict[str, Any])
async def evaluate_model_endpoint(
    model_id: str, data: EvaluationInput
) -> Dict[str, Any]:
    """
    Evaluate a model using the specified model's evaluation endpoint configuration.

    Parameters
    ----------
    model_id : str
        The ID of the model to evaluate.
    data : EvaluationInput
        The input data for the evaluation.

    Returns
    -------
    Dict[str, Any]
        The evaluation results.

    Raises
    ------
    HTTPException
        If there's an error during evaluation.
    """
    try:
        return evaluate_model(model_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/models/{model_id}/performance", response_model=Dict[str, Any])
async def get_model_performance(model_id: str) -> Dict[str, Any]:
    """
    Retrieve performance metrics for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve performance metrics for.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the performance metrics.

    Raises
    ------
    HTTPException
        If there's an error retrieving the performance metrics.
    """
    try:
        return await get_performance_metrics(model_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving performance metrics: {str(e)}"
        ) from e


@router.get("/models/{model_id}/health", response_model=ModelHealth)
async def get_model_health_status(model_id: str) -> ModelHealth:
    """
    Retrieve health information for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve health information for.

    Returns
    -------
    ModelHealth
        The health information for the specified model.

    Raises
    ------
    HTTPException
        If there's an error retrieving the model health.
    """
    try:
        return await get_model_health(model_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        ) from e
