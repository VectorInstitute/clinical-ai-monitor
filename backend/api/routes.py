"""Routes for the API."""

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from backend.api.models.configure import (
    EvaluationInput,
    ServerConfig,
    create_evaluation_server,
    delete_evaluation_server,
    evaluate_model,
    list_evaluation_servers,
)
from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


# Create a router instance
router: APIRouter = APIRouter()

# Set up logging
logger: logging.Logger = logging.getLogger("uvicorn.error")


@router.get("/performance_metrics", response_model=Dict[str, Any])
async def performance_metrics() -> Dict[str, Any]:
    """
    Retrieve performance metrics for the model.

    Returns
    -------
    Dict[str, Any]
        Dict containing performance metrics

    Raises
    ------
    HTTPException
        If there's an error retrieving performance metrics
    """
    try:
        return await get_performance_metrics()
    except Exception as e:
        logger.error("Error retrieving performance metrics: %s", str(e))
        raise HTTPException(
            status_code=500, detail="Error retrieving performance metrics"
        )


@router.get("/model/{model_id}/health", response_model=ModelHealth)
async def model_health(model_id: str) -> ModelHealth:
    """
    Retrieve health information for a specific model.

    Parameters
    ----------
    model_id : str
        The unique identifier of the model

    Returns
    -------
    ModelHealth
        ModelHealth object containing model health information

    Raises
    ------
    HTTPException
        If there's an error retrieving model health
    """
    try:
        return await get_model_health(model_id)
    except HTTPException:
        # Re-raise HTTP exceptions from the model function
        raise
    except Exception as e:
        logger.error("Error retrieving model health: %s", str(e))
        raise HTTPException(status_code=500, detail="Error retrieving model health")


@router.delete("/delete_evaluation_server/{server_name}")
async def delete_server(server_name: str) -> Dict[str, str]:
    """
    Delete an existing evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to delete

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message

    Raises
    ------
    HTTPException
        If there's an error deleting the evaluation server
    """
    try:
        return delete_evaluation_server(server_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Error deleting evaluation server: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


# Update the existing create_server function to include model_name and model_description
@router.post("/create_evaluation_server")
async def create_server(config: ServerConfig) -> Dict[str, str]:
    """
    Create a new evaluation server configuration.

    Parameters
    ----------
    config : ServerConfig
        The configuration for the new evaluation server

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message

    Raises
    ------
    HTTPException
        If there's an error creating the evaluation server
    """
    try:
        return create_evaluation_server(config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Error creating evaluation server: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


# Update the existing get_evaluation_servers function
@router.get("/evaluation_servers")
async def get_evaluation_servers() -> Dict[str, List[Dict[str, str]]]:
    """
    List all created evaluation servers.

    Returns
    -------
    Dict[str, List[Dict[str, str]]]
        A dictionary containing a list of server details
    """
    return list_evaluation_servers()


@router.post("/evaluate/{server_name}")
async def evaluate(server_name: str, data: EvaluationInput) -> Dict[str, Any]:
    """
    Evaluate a model using the specified evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to use
    data : EvaluationInput
        The input data for evaluation

    Returns
    -------
    Dict[str, Any]
        The evaluation results

    Raises
    ------
    HTTPException
        If the specified server does not exist or there's an error during evaluation
    """
    try:
        return evaluate_model(server_name, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Error evaluating model: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
