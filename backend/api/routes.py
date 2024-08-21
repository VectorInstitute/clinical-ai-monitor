"""Backend API routes."""

from datetime import timedelta
from typing import Any, Dict, List, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from api.db_config import get_models_async_session, get_users_async_session
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
    delete_user,
    get_users,
    update_user,
    update_user_password,
)
from api.users.data import User, UserCreate
from api.users.utils import verify_password


router = APIRouter()


@router.post("/endpoints", response_model=Dict[str, str])
async def create_endpoint_route(
    config: EndpointConfig,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Create a new evaluation endpoint.

    Parameters
    ----------
    config : EndpointConfig
        The configuration for the new endpoint.
    session : AsyncSession
        The database session.

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
        result = await create_evaluation_endpoint(config, session)
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
async def get_evaluation_endpoints_route(
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of all evaluation endpoints.
    """
    result = await list_evaluation_endpoints(session)
    return cast(Dict[str, List[EndpointDetails]], result)


@router.get("/models", response_model=Dict[str, ModelData])
async def get_models_route(
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, ModelData]:
    """
    List all models.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, ModelData]
        A dict with all models, with model IDs as keys and ModelData as values.
    """
    return cast(Dict[str, ModelData], await list_models(session))


@router.get("/models/{model_id}", response_model=ModelData)
async def get_model_route(
    model_id: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> ModelData:
    """
    Get details of a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve.
    session : AsyncSession
        The database session.

    Returns
    -------
    ModelData
        The detailed information of the specified model.

    Raises
    ------
    HTTPException
        If the model is not found or there's an error retrieving the model data.
    """
    model = await get_model_by_id(model_id, session)
    if model is None:
        raise HTTPException(
            status_code=404, detail=f"Model with ID {model_id} not found"
        )
    return model


@router.post("/evaluate/{endpoint_name}/{model_id}", response_model=Dict[str, Any])
async def evaluate_route(
    endpoint_name: str,
    model_id: str,
    data: EvaluationInput,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
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
    session : AsyncSession
        The database session.

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
        result = await evaluate_model(endpoint_name, model_id, data, session)
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
async def get_endpoint_logs_route(
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> List[EndpointLog]:
    """
    Get logs for all endpoints.

    Parameters
    ----------
    session : AsyncSession
        The database session.

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
        logs = await get_endpoint_logs(session)
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
    endpoint_name: str,
    model_id: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, Any]:
    """
    Retrieve performance metrics for the model.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to retrieve performance metrics for.
    model_id : str
        The ID of the model for which the performance metrics are to be retrieved.
    session : AsyncSession
        The database session.

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
        metrics = await get_performance_metrics(endpoint_name, model_id, session)
        if not isinstance(metrics, dict):
            raise ValueError("Unexpected result type from get_performance_metrics")
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving performance metrics: {str(e)}"
        ) from e


@router.get("/model/{model_id}/safety", response_model=ModelSafety)
async def get_model_safety_route(
    model_id: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> ModelSafety:
    """
    Retrieve safety status, checklist for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve safety information for.
    session : AsyncSession
        The database session.

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
        return await get_model_safety(model_id, session)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model health: {str(e)}"
        ) from e


@router.delete("/endpoints/{endpoint_name}", response_model=Dict[str, str])
async def delete_endpoint_route(
    endpoint_name: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Delete an existing evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to delete.
    session : AsyncSession
        The database session.

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
        result = await delete_evaluation_endpoint(endpoint_name, session)
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
async def get_model_facts_route(
    model_id: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Optional[ModelFacts]:
    """
    Retrieve facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve facts for.
    session : AsyncSession
        The database session.

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
        return await get_model_facts(model_id, session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model facts: {str(e)}"
        ) from e


@router.post("/models/{model_id}/facts", response_model=ModelFacts)
async def update_model_facts_route(
    model_id: str,
    facts: ModelFacts,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> ModelFacts:
    """
    Update facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to update facts for.
    facts : ModelFacts
        The updated facts for the model.
    session : AsyncSession
        The database session.

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
        return await update_model_facts(model_id, facts.dict(), session)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating model facts: {str(e)}"
        ) from e


@router.post("/endpoints/{endpoint_name}/models", response_model=Dict[str, str])
async def add_model_to_endpoint_route(
    endpoint_name: str,
    model_info: ModelBasicInfo,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Add a model to an existing endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to add the model to.
    model_info : ModelBasicInfo
        Basic information about the model to be added.
    session : AsyncSession
        The database session.

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
        return cast(
            Dict[str, str],
            await add_model_to_endpoint(endpoint_name, model_info, session),
        )
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
    endpoint_name: str,
    model_id: str,
    session: AsyncSession = Depends(get_models_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Remove a model from an existing endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to remove the model from.
    model_id : str
        The ID of the model to be removed.
    session : AsyncSession
        The database session.

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
        return cast(
            Dict[str, str],
            await remove_model_from_endpoint(endpoint_name, model_id, session),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.post("/auth/signin")
async def signin(
    request: Request,
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> Dict[str, Any]:
    """
    Authenticate a user and return an access token.

    Parameters
    ----------
    request : Request
        The incoming request object.
    db : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the access token, token type, and user information.

    Raises
    ------
    HTTPException
        If the credentials are invalid or missing.
    """
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username and password are required",
        )

    user = await authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "role": user.role},
    }


@router.post("/auth/signout")
async def signout(
    request: Request,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
) -> Dict[str, str]:
    """
    Sign out the current user.

    Parameters
    ----------
    request : Request
        The incoming request object.
    current_user : User
        The current authenticated user.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If the user is not authenticated.
    """
    return {"message": "Successfully signed out"}


@router.get("/auth/session")
async def get_session(
    current_user: User = Depends(get_current_active_user),  # noqa: B008
) -> Dict[str, Any]:
    """
    Get the current user's session information.

    Parameters
    ----------
    current_user : User
        The current authenticated user.

    Returns
    -------
    Dict[str, Any]
        A dictionary containing the user's session information.

    Raises
    ------
    HTTPException
        If the user is not authenticated.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
        }
    }


@router.post("/auth/signup", response_model=User)
async def signup(
    user: UserCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> User:
    """
    Create a new user (admin only).

    Parameters
    ----------
    user : UserCreate
        The user data to create.
    current_user : User
        The current authenticated user.
    db : AsyncSession
        The asynchronous database session.

    Returns
    -------
    User
        The created user.

    Raises
    ------
    HTTPException
        If the current user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create users",
        )
    return await create_user(db=db, user=user)


@router.get("/users", response_model=List[User])
async def get_users_route(
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> List[User]:
    """
    Get a list of users (admin only).

    Parameters
    ----------
    current_user : User
        The current authenticated user.
    skip : int, optional
        The number of users to skip, by default 0.
    limit : int, optional
        The maximum number of users to return, by default 100.
    db : AsyncSession
        The asynchronous database session.

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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view users"
        )
    return list(await get_users(db, skip=skip, limit=limit))


@router.put("/users/{user_id}", response_model=User)
async def update_user_route(
    user_id: int,
    user_update: UserCreate,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> User:
    """
    Update a user (admin only).

    Parameters
    ----------
    user_id : int
        The ID of the user to update.
    user_update : UserCreate
        The updated user data.
    current_user : User
        The current authenticated user.
    db : AsyncSession
        The asynchronous database session.

    Returns
    -------
    User
        The updated user.

    Raises
    ------
    HTTPException
        If the current user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update users",
        )
    return await update_user(db=db, user_id=user_id, user_update=user_update)


@router.post("/auth/update-password")
async def update_password(
    request: Request,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Update the current user's password.

    Parameters
    ----------
    request : Request
        The incoming request object.
    current_user : User
        The current authenticated user.
    db : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If the current password is incorrect or the new password is invalid.
    """
    data = await request.json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Current password and new password are required",
        )

    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect current password",
        )

    try:
        await update_user_password(db, current_user.id, new_password)
        await db.commit()
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the password",
        ) from e

    return {"message": "Password updated successfully"}


@router.delete("/users/{user_id}")
async def delete_user_route(
    user_id: int,
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    db: AsyncSession = Depends(get_users_async_session),  # noqa: B008
) -> Dict[str, str]:
    """
    Delete a user (admin only).

    Parameters
    ----------
    user_id : int
        The ID of the user to delete.
    current_user : User
        The current authenticated user.
    db : AsyncSession
        The asynchronous database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If the current user is not an admin or if the user is not found.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete users",
        )

    success = await delete_user(db=db, user_id=user_id)
    if success:
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
