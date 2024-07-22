"""Model facts API functions."""

from typing import List, Optional

from pydantic import BaseModel, Field


class ValidationAndPerformance(BaseModel):
    """Validation and performance information for a model."""

    internal_validation: str = Field(..., description="Internal validation results")
    external_validation: str = Field(..., description="External validation results")
    performance_in_subgroups: List[str] = Field(
        ..., description="Performance in different subgroups"
    )


class OtherInformation(BaseModel):
    """Other information about a model."""

    approval_date: str = Field(..., description="Date of model approval")
    license: str = Field(..., description="License information")
    contact_information: str = Field(
        ..., description="Contact information for model support"
    )
    publication_link: Optional[str] = Field(
        None, description="Link to related publication"
    )


class ModelFacts(BaseModel):
    """Comprehensive facts about a model."""

    name: str = Field(..., description="Name of the model")
    version: str = Field(..., description="Version of the model")
    type: str = Field(..., description="Type of the model")
    intended_use: str = Field(..., description="Intended use of the model")
    target_population: str = Field(..., description="Target population for the model")
    input_data: List[str] = Field(..., description="Required input data for the model")
    output_data: str = Field(..., description="Output data produced by the model")
    summary: str = Field(..., description="Brief summary of the model")
    mechanism_of_action: str = Field(
        ..., description="Mechanism of action for the model"
    )
    validation_and_performance: ValidationAndPerformance = Field(
        ..., description="Validation and performance information"
    )
    uses_and_directions: List[str] = Field(
        ..., description="Uses and directions for the model"
    )
    warnings: List[str] = Field(
        ..., description="Warnings and precautions for model use"
    )
    other_information: OtherInformation = Field(
        ..., description="Additional model information"
    )


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
