"""Model facts API functions."""

from typing import Any, Dict

from pydantic import ValidationError

from api.models.data import ModelFacts
from api.models.db import load_model_data, save_model_data


def get_model_facts(model_id: str) -> ModelFacts:
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

    Raises
    ------
    ValueError
        If the model ID is not found.
    """
    model_data = load_model_data(model_id)
    if not model_data:
        raise ValueError(f"Model with ID {model_id} not found")
    return model_data.facts


def update_model_facts(model_id: str, updated_facts: Dict[str, Any]) -> ModelFacts:
    """
    Update facts for a specific model.

    Parameters
    ----------
    model_id : str
        The ID of the model to update facts for.
    updated_facts : Dict[str, Any]
        A dictionary containing the updated facts.

    Returns
    -------
    ModelFacts
        The updated facts for the specified model.

    Raises
    ------
    ValueError
        If the model ID is not found or if the updated facts are invalid.
    """
    model_data = load_model_data(model_id)
    if not model_data:
        raise ValueError(f"Model with ID {model_id} not found")

    try:
        updated_model_facts = model_data.facts.copy(update=updated_facts)
        model_data.facts = updated_model_facts
        save_model_data(model_id, model_data)
        return updated_model_facts
    except ValidationError as e:
        raise ValueError(f"Invalid updated facts: {str(e)}")
