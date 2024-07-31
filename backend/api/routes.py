"""Backend API routes."""

from typing import Any, Dict, List, cast

from fastapi import APIRouter, HTTPException

from api.models.config import EndpointConfig
from api.models.data import ModelBasicInfo, ModelData
from api.models.evaluate import (
    EndpointDetails,
    EndpointLog,
    EvaluationInput,
    add_model_to_endpoint,
    create_evaluation_endpoint,
    delete_evaluation_endpoint,
    evaluate_model,
    get_endpoint_logs,
    get_model_by_id,
    list_evaluation_endpoints,
    list_models,
    remove_model_from_endpoint,
)
from api.models.facts import ModelFacts, get_model_facts
from api.models.health import ModelHealth, get_model_health
from api.models.performance import get_performance_metrics


router = APIRouter()


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
        result = create_evaluation_endpoint(config)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return cast(Dict[str, str], result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/endpoints", response_model=Dict[str, List[EndpointDetails]])
async def get_evaluation_endpoints() -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of all evaluation endpoints.
    """
    result = list_evaluation_endpoints()
    return cast(Dict[str, List[EndpointDetails]], result)


@router.get("/models", response_model=Dict[str, ModelData])
async def get_models() -> Dict[str, ModelData]:
    """
    List all models.

    Returns
    -------
    Dict[str, ModelData]
        A dictionary containing all models, with model IDs as keys and ModelData as values.
    """
    return list_models()


@router.get("/models/{model_id}", response_model=ModelData)
async def get_model_route(model_id: str) -> ModelData:
    """
    Get details of a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve.

    Returns
    -------
    ModelData
        The detailed information of the specified model.

    Raises
    ------
    HTTPException
        If the model is not found or there's an error retrieving the model data.
    """
    model = get_model_by_id(model_id)
    if model is None:
        raise HTTPException(
            status_code=404, detail=f"Model with ID {model_id} not found"
        )
    return model


@router.post("/evaluate/{endpoint_name}", response_model=Dict[str, Any])
async def evaluate(endpoint_name: str, data: EvaluationInput) -> Dict[str, Any]:
    """
    Evaluate a model using the specified evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to use for evaluation.
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
        result = evaluate_model(endpoint_name, data)
        if not isinstance(result, dict):
            raise ValueError("Unexpected result type from evaluate_model")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/endpoint_logs", response_model=List[EndpointLog])
async def endpoint_logs() -> List[EndpointLog]:
    """
    Get logs for all endpoints.

    Returns
    -------
    List[EndpointLog]
        A list of logs for all endpoints.

    Raises
    ------
    HTTPException
        If there's an error retrieving the logs.
    """
    try:
        logs = get_endpoint_logs()
        if not isinstance(logs, list):
            raise ValueError("Unexpected result type from get_endpoint_logs")
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get(
    "/performance_metrics/{endpoint_name}/{model_id}", response_model=Dict[str, Any]
)
async def get_performance_metrics_for_endpoint(
    endpoint_name: str, model_id: str
) -> Dict[str, Any]:
    """
    Retrieve performance metrics for the model.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to retrieve performance metrics for.
    model_id : str
        The ID of the model for which the performance metrics are to be retrieved.

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
        metrics = await get_performance_metrics(endpoint_name, model_id)
        if not isinstance(metrics, dict):
            raise ValueError("Unexpected result type from get_performance_metrics")
        return metrics
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


@router.delete("/endpoints/{endpoint_name}", response_model=Dict[str, str])
async def delete_endpoint(endpoint_name: str) -> Dict[str, str]:
    """
    Delete an existing evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to delete.

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
        result = delete_evaluation_endpoint(endpoint_name)
        if not isinstance(result, dict):
            raise ValueError("Unexpected result type from delete_evaluation_endpoint")
        return cast(Dict[str, str], result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/models/{model_id}/facts", response_model=ModelFacts)
async def get_model_facts_route(model_id: str) -> ModelFacts:
    """
    Retrieve facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve facts for.

    Returns
    -------
    ModelFacts
        The facts for the specified model.
    """
    try:
        return get_model_facts(model_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model facts: {str(e)}"
        )


@router.post("/endpoints/{endpoint_name}/models", response_model=Dict[str, str])
async def add_model_to_endpoint_route(
    endpoint_name: str, model_info: ModelBasicInfo
) -> Dict[str, str]:
    """
    Add a model to an existing endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to add the model to.
    model_info : ModelBasicInfo
        Basic information about the model to be added.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message and the new model ID.

    Raises
    ------
    HTTPException
        If there's an error during model addition.
    """
    try:
        result = add_model_to_endpoint(endpoint_name, model_info)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete(
    "/endpoints/{endpoint_name}/models/{model_id}", response_model=Dict[str, str]
)
async def remove_model_from_endpoint_route(
    endpoint_name: str, model_id: str
) -> Dict[str, str]:
    """
    Remove a model from an existing endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to remove the model from.
    model_id : str
        The ID of the model to be removed.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If there's an error during model removal.
    """
    try:
        result = remove_model_from_endpoint(endpoint_name, model_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
