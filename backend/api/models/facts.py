"""Model facts API functions."""

from typing import Any, Dict, Optional

from pydantic import ValidationError

from api.models.data import ModelFacts, OtherInformation, ValidationAndPerformance
from api.models.db import load_model_data, save_model_data


def get_model_facts(model_id: str) -> Optional[ModelFacts]:
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
    ValueError
        If the model ID is not found.
    """
    model_data = load_model_data(model_id)
    if not model_data:
        raise ValueError(f"Model with ID {model_id} not found")
    return model_data.facts


def get_model_facts_test(model_id: str) -> ModelFacts:
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
    # In a real implementation, this would fetch data from a database
    # For now, we'll return mock data
    return ModelFacts(
        name="Pneumothorax Prediction Model",
        version="1.0.0",
        type="Deep Learning Model",
        intended_use="Predict risk of pneumothorax using chest x-rays",
        target_population="Adult patients (18+ years)",
        input_data=["Chest X-ray image"],
        output_data="Pneumothorax risk score (0-1)",
        summary="This model predicts the risk of pneumothorax using chest x-rays.",
        mechanism_of_action="The model uses a deep learning algorithm that processes chest x-rays to predict the risk of pneumothorax.",
        validation_and_performance=ValidationAndPerformance(
            internal_validation="AUC: 0.85 (95% CI: 0.83-0.87)",
            external_validation="AUC: 0.82 (95% CI: 0.80-0.84) at Toronto General Hospital",
            performance_in_subgroups=[
                "Similar performance across age groups",
                "Slightly lower performance in female patients (AUC: 0.80)",
            ],
        ),
        uses_and_directions=[
            "Use for adult patients (18+ years)",
            "Check risk score every 4 weeks",
            "High risk (>0.7): Consider immediate clinical assessment",
        ],
        warnings=[
            "Do not use for patients already diagnosed with pneumothorax",
            "Not validated for use in ICU settings",
            "Model performance may degrade over time - regular re-validation required",
        ],
        other_information=OtherInformation(
            approval_date="January 1, 2023",
            license="MIT License",
            contact_information="support@example.com",
            publication_link="https://doi.org/10.1038/s41746-020-0253-3",
        ),
    )


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
        raise ValueError(f"Invalid updated facts: {str(e)}") from e
