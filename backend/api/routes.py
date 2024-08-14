"""Backend API routes."""

from datetime import timedelta
from typing import Any, Dict, List, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

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
from api.models.facts import ModelFacts, get_model_facts, update_model_facts
from api.models.performance import get_performance_metrics
from api.models.safety import ModelSafety, get_model_safety
from api.users.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    authenticate_user,
    create_access_token,
    get_current_active_user,
)
from api.users.crud import (
    create_user,
    get_user,
    get_user_by_username,
    get_users,
    update_user,
)
from api.users.data import Token, User, UserCreate
from api.users.db import get_db


router = APIRouter()


@router.post("/endpoints", response_model=Dict[str, str])
async def create_endpoint_route(config: EndpointConfig) -> Dict[str, str]:
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
async def get_evaluation_endpoints_route() -> Dict[str, List[EndpointDetails]]:
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
async def get_models_route() -> Dict[str, ModelData]:
    """
    List all models.

    Returns
    -------
    Dict[str, ModelData]
        A dict with all models, with model IDs as keys and ModelData as values.
    """
    return cast(Dict[str, ModelData], list_models())


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


@router.post("/evaluate/{endpoint_name}/{model_id}", response_model=Dict[str, Any])
async def evaluate_route(
    endpoint_name: str, model_id: str, data: EvaluationInput
) -> Dict[str, Any]:
    """
    Evaluate a model using the specified evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to use for evaluation.
    model_id : str
        The ID of the model to use for evaluation.
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
        result = evaluate_model(endpoint_name, model_id, data)
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
async def get_endpoint_logs_route() -> List[EndpointLog]:
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
async def get_performance_metrics_route(
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


@router.get("/model/{model_id}/safety", response_model=ModelSafety)
async def get_model_safety_route(model_id: str) -> ModelSafety:
    """
    Retrieve safety status, checklist for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve safety information for.

    Returns
    -------
    ModelSafety
        The safety information for the specified model.

    Raises
    ------
    HTTPException
        If there's an error retrieving the model health.
    """
    try:
        return await get_model_safety(model_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        ) from e


@router.delete("/endpoints/{endpoint_name}", response_model=Dict[str, str])
async def delete_endpoint_route(endpoint_name: str) -> Dict[str, str]:
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


@router.get("/models/{model_id}/facts", response_model=Optional[ModelFacts])
async def get_model_facts_route(model_id: str) -> Optional[ModelFacts]:
    """
    Retrieve facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve facts for.

    Returns
    -------
    Optional[ModelFacts]
        The facts for the specified model, or None if not available.

    Raises
    ------
    HTTPException
        If there's an error retrieving the model facts.
    """
    try:
        return get_model_facts(model_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model facts: {str(e)}"
        ) from e


@router.post("/models/{model_id}/facts", response_model=ModelFacts)
async def update_model_facts_route(model_id: str, facts: ModelFacts) -> ModelFacts:
    """
    Update facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to update facts for.
    facts : ModelFacts
        The updated facts for the model.

    Returns
    -------
    ModelFacts
        The updated facts for the specified model.

    Raises
    ------
    HTTPException
        If there's an error updating the model facts.
    """
    try:
        return update_model_facts(model_id, facts.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating model facts: {str(e)}"
        ) from e


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
        return cast(Dict[str, str], add_model_to_endpoint(endpoint_name, model_info))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


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
        return cast(Dict[str, str], remove_model_from_endpoint(endpoint_name, model_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.post("/token", response_model=Token)
async def login_for_access_token_route(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    """
    Authenticate user and return an access token.

    Parameters
    ----------
    form_data : OAuth2PasswordRequestForm
        The form data containing username and password.
    db : Session
        The database session.

    Returns
    -------
    Token
        The access token and token type.

    Raises
    ------
    HTTPException
        If authentication fails.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users", response_model=User)
async def create_user_route(
    user: UserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> User:
    """
    Create a new user (admin only).

    Parameters
    ----------
    user : UserCreate
        The user data to create.
    current_user : User
        The current authenticated user.
    db : Session
        The database session.

    Returns
    -------
    User
        The created user.

    Raises
    ------
    HTTPException
        If the current user is not an admin or if the username already exists.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)


@router.get("/users", response_model=List[User])
async def get_users_route(
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[User]:
    """
    Retrieve a list of users (admin only).

    Parameters
    ----------
    current_user : User
        The current authenticated user.
    skip : int, optional
        The number of users to skip, by default 0.
    limit : int, optional
        The maximum number of users to return, by default 100.
    db : Session
        The database session.

    Returns
    -------
    List[User]
        A list of users.

    Raises
    ------
    HTTPException
        If the current user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view users")
    return get_users(db, skip=skip, limit=limit)


@router.get("/users/me", response_model=User)
async def get_current_active_user_route(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Get the current user's information.

    Parameters
    ----------
    current_user : User
        The current authenticated user.

    Returns
    -------
    User
        The current user's information.
    """
    return current_user


@router.put("/users/{user_id}", response_model=User)
async def update_user_route(
    user_id: int,
    user_update: UserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> User:
    """
    Update a user's information (admin only).

    Parameters
    ----------
    user_id : int
        The ID of the user to update.
    user_update : UserCreate
        The updated user data.
    current_user : User
        The current authenticated user.
    db : Session
        The database session.

    Returns
    -------
    User
        The updated user information.

    Raises
    ------
    HTTPException
        If the current user is not an admin or if the user is not found.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update users")
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db=db, user=db_user, user_update=user_update)
