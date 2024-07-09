"""Backend API routes."""

from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.api.models.configure import (
    EvaluationInput,
    EvaluationResult,
    ServerConfig,
    create_evaluation_server,
    delete_evaluation_server,
    evaluate_model,
    list_evaluation_servers,
)
from backend.api.models.health import ModelHealth, get_model_health
from backend.api.models.performance import get_performance_metrics


router = APIRouter()


class ServerLog(BaseModel):
    """
    Server log model.

    Parameters
    ----------
    id : str
        Unique identifier for the server log.
    server_name : str
        Name of the server.
    created_at : datetime
        Timestamp when the server was created.
    last_evaluated : datetime
        Timestamp of the last evaluation.
    evaluation_count : int
        Number of evaluations performed.
    """

    id: str
    server_name: str
    created_at: datetime
    last_evaluated: datetime
    evaluation_count: int


@router.get("/server-logs", response_model=List[ServerLog])
async def get_server_logs() -> List[ServerLog]:
    """
    Get server logs.

    Returns
    -------
    List[ServerLog]
        A list of server logs.
    """
    return [
        ServerLog(
            id="1",
            server_name="Server1",
            created_at=datetime.now(),
            last_evaluated=datetime.now(),
            evaluation_count=10,
        ),
        ServerLog(
            id="2",
            server_name="Server2",
            created_at=datetime.now(),
            last_evaluated=datetime.now(),
            evaluation_count=5,
        ),
    ]


@router.post("/create_evaluation_server", response_model=Dict[str, str])
async def create_server(config: ServerConfig) -> Dict[str, str]:
    """
    Create a new evaluation server.

    Parameters
    ----------
    config : ServerConfig
        The configuration for the new evaluation server.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If there's an error creating the evaluation server.
    """
    try:
        return create_evaluation_server(config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/evaluation_servers", response_model=Dict[str, List[Dict[str, str]]])
async def get_evaluation_servers() -> Dict[str, List[Dict[str, str]]]:
    """
    List all created evaluation servers.

    Returns
    -------
    Dict[str, List[Dict[str, str]]]
        A dictionary containing a list of server details.
    """
    return list_evaluation_servers()


@router.post("/evaluate/{server_name}", response_model=Dict[str, Any])
async def evaluate(server_name: str, data: EvaluationInput) -> EvaluationResult:
    """
    Evaluate a model using the specified evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to use.
    data : EvaluationInput
        The input data for evaluation.

    Returns
    -------
    EvaluationResult
        The evaluation results.

    Raises
    ------
    HTTPException
        If the specified server does not exist or there's an error during evaluation.
    """
    try:
        return evaluate_model(server_name, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/performance_metrics/{server_name}", response_model=Dict[str, Any])
async def performance_metrics(server_name: str) -> Dict[str, Any]:
    """
    Retrieve performance metrics for the model.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server.

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
        return await get_performance_metrics(server_name)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving performance metrics: {str(e)}"
        ) from e


@router.get("/model/{model_id}/health", response_model=ModelHealth)
async def model_health(model_id: str) -> ModelHealth:
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


@router.delete("/delete_evaluation_server/{server_name}", response_model=Dict[str, str])
async def delete_server(server_name: str) -> Dict[str, str]:
    """
    Delete an existing evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If there's an error deleting the evaluation server.
    """
    try:
        return delete_evaluation_server(server_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e
