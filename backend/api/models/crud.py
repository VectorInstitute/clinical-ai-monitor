"""CRUD operations for model monitoring."""

import json
from typing import Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.models.config import EndpointConfig
from api.models.data import (
    EndpointData,
    EndpointLog,
    EvaluationResult,
    ModelBasicInfo,
    ModelData,
    ModelFacts,
)
from api.models.db import EndpointDataDB, ModelDataDB


async def save_model_data(session: AsyncSession, model_data: ModelData) -> None:
    """
    Save model data to the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    model_data : ModelData
        The model data to save.

    Returns
    -------
    None
    """
    db_model = ModelDataDB(
        id=model_data.id,
        name=model_data.basic_info.name,
        version=model_data.basic_info.version,
        endpoints=json.dumps(model_data.endpoints),
        facts=json.dumps(model_data.facts.dict()) if model_data.facts else None,
    )
    session.add(db_model)
    await session.commit()


async def load_model_data(session: AsyncSession, model_id: str) -> Optional[ModelData]:
    """
    Load model data from the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    model_id : str
        The ID of the model to load.

    Returns
    -------
    Optional[ModelData]
        The loaded model data, or None if not found.
    """
    result = await session.execute(
        select(ModelDataDB).where(ModelDataDB.id == model_id)
    )
    db_model = result.scalar_one_or_none()
    if db_model:
        return ModelData(
            id=db_model.id,
            endpoints=json.loads(db_model.endpoints),
            basic_info=ModelBasicInfo(name=db_model.name, version=db_model.version),
            facts=ModelFacts(**json.loads(db_model.facts)) if db_model.facts else None,
        )
    return None


async def save_endpoint_data(
    session: AsyncSession, endpoint_name: str, data: EndpointData
) -> None:
    """
    Save endpoint data to the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    endpoint_name : str
        The name of the endpoint.
    data : EndpointData
        The endpoint data to save.

    Returns
    -------
    None
    """
    db_endpoint = EndpointDataDB(
        name=endpoint_name,
        config=data.config.dict(),
        evaluation_history={
            k: [er.dict() for er in v] for k, v in data.evaluation_history.items()
        },
        logs=[log.dict() for log in data.logs],
        models=data.models,
    )
    session.add(db_endpoint)
    await session.commit()


async def load_endpoint_data(
    session: AsyncSession, endpoint_name: str
) -> Optional[EndpointData]:
    """
    Load endpoint data from the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    endpoint_name : str
        The name of the endpoint to load.

    Returns
    -------
    Optional[EndpointData]
        The loaded endpoint data, or None if not found.
    """
    result = await session.execute(
        select(EndpointDataDB).where(EndpointDataDB.name == endpoint_name)
    )
    db_endpoint = result.scalar_one_or_none()
    if db_endpoint:
        return EndpointData(
            config=EndpointConfig(**db_endpoint.config),
            evaluation_history={
                k: [EvaluationResult(**er) for er in v]
                for k, v in db_endpoint.evaluation_history.items()
            },
            logs=[EndpointLog(**log) for log in db_endpoint.logs],
            models=db_endpoint.models,
        )
    return None


async def delete_endpoint_data(session: AsyncSession, endpoint_name: str) -> None:
    """
    Delete endpoint data from the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.
    endpoint_name : str
        The name of the endpoint to delete.

    Returns
    -------
    None

    Raises
    ------
    ValueError
        If the endpoint is not found.
    """
    result = await session.execute(
        select(EndpointDataDB).where(EndpointDataDB.name == endpoint_name)
    )
    db_endpoint = result.scalar_one_or_none()
    if db_endpoint:
        await session.delete(db_endpoint)
        await session.commit()
    else:
        raise ValueError(f"Endpoint '{endpoint_name}' not found")


async def list_all_endpoints(session: AsyncSession) -> List[str]:
    """
    List all endpoint names in the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    List[str]
        A list of all endpoint names.
    """
    result = await session.execute(select(EndpointDataDB.name))
    return [row[0] for row in result.fetchall()]


async def list_all_models(session: AsyncSession) -> Dict[str, ModelData]:
    """
    List all models in the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, ModelData]
        A dictionary of all models, with model IDs as keys and ModelData as values.
    """
    result = await session.execute(select(ModelDataDB))
    models = {}
    for db_model in result.scalars():
        endpoints = db_model.endpoints
        if isinstance(endpoints, str):
            try:
                endpoints = json.loads(endpoints)
            except json.JSONDecodeError:
                endpoints = []
        elif not isinstance(endpoints, list):
            endpoints = []

        models[db_model.id] = ModelData(
            id=db_model.id,
            endpoints=endpoints,
            basic_info=ModelBasicInfo(name=db_model.name, version=db_model.version),
            facts=ModelFacts(**json.loads(db_model.facts)) if db_model.facts else None,
        )
    return models
