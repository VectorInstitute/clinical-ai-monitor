"""Model facts API functions."""

from typing import Any, Dict, Optional

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from api.models.crud import load_model_data, save_model_data
from api.models.data import ModelData, ModelFacts


async def get_model_facts(model_id: str, session: AsyncSession) -> Optional[ModelFacts]:
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
    ValueError
        If the model ID is not found.
    """
    model_data = await load_model_data(session, model_id)
    if not model_data:
        raise ValueError(f"Model with ID {model_id} not found")
    return model_data.facts if model_data.facts else None


async def update_model_facts(
    model_id: str, updated_facts: Dict[str, Any], session: AsyncSession
) -> ModelFacts:
    """
    Update facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to update facts for.
    updated_facts : Dict[str, Any]
        A dictionary containing the updated facts.
    session : AsyncSession
        The database session.

    Returns
    -------
    ModelFacts
        The updated facts for the specified model.

    Raises
    ------
    ValueError
        If the model ID is not found or if the updated facts are invalid.
    """
    model_data = await load_model_data(session, model_id)
    if not model_data:
        raise ValueError(f"Model with ID {model_id} not found")

    try:
        if model_data.facts is None:
            model_data.facts = ModelFacts(**updated_facts)
        else:
            model_data.facts = model_data.facts.copy(update=updated_facts)

        updated_model_data = ModelData(
            id=model_data.id,
            endpoints=model_data.endpoints,
            basic_info=model_data.basic_info,
            facts=model_data.facts,
        )

        await save_model_data(session, updated_model_data)
        return model_data.facts
    except ValidationError as e:
        raise ValueError(f"Invalid updated facts: {str(e)}") from e
