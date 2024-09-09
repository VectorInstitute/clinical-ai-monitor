"""Dataclasses for evaluation input and output."""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator

from api.models.config import EndpointConfig
from api.models.utils import deep_convert_numpy


class ModelBasicInfo(BaseModel):
    """Basic information about a model."""

    name: str = Field(..., description="Name of the model")
    version: str = Field(..., description="Version of the model")


class ValidationAndPerformance(BaseModel):
    """Validation and performance information for a model."""

    internal_validation: str = Field(..., description="Internal validation results")
    external_validation: str = Field(..., description="External validation results")
    performance_in_subgroups: List[str] = Field(
        ..., description="Performance in different subgroups"
    )


class OtherInformation(BaseModel):
    """Additional information about a model."""

    approval_date: str = Field(..., description="Date of model approval")
    license: str = Field(..., description="License information")
    contact_information: str = Field(
        ..., description="Contact information for model support"
    )
    publication_link: Optional[str] = Field(
        None, description="Link to related publication"
    )


class ModelFacts(ModelBasicInfo):
    """Comprehensive facts about a model."""

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


class ComparisonOperator(str, Enum):
    """Comparison operator for evaluation criteria."""

    GREATER_THAN = ">"
    LESS_THAN = "<"
    EQUAL_TO = "="
    GREATER_THAN_OR_EQUAL_TO = ">="
    LESS_THAN_OR_EQUAL_TO = "<="


class EvaluationCriterion(BaseModel):
    """Evaluation criterion for a model.

    Attributes
    ----------
    id: str
        Unique identifier for the criterion.
    metric_name: str
        Name of the metric.
    operator: ComparisonOperator
        Comparison operator.
    threshold: float
        Threshold value for the criterion.
    """

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for the criterion",
    )
    metric_name: str = Field(..., description="Name of the metric")
    display_name: str = Field(..., description="Display name of the metric")
    operator: ComparisonOperator = Field(..., description="Comparison operator")
    threshold: float = Field(..., description="Threshold value for the criterion")


class EvaluationFrequency(BaseModel):
    """Frequency at which the model is evaluated.

    Attributes
    ----------
    value: int
        The value of the frequency.
    unit: str
        The unit of the frequency.
    """

    value: int
    unit: str


class ModelData(BaseModel):
    """Data structure for storing model information.

    Attributes
    ----------
    id : str
        Unique identifier for the model.
    endpoints : List[str]
        List of endpoints associated with the model.
    basic_info : ModelBasicInfo
        Basic information about the model, including name and version.
    facts : Optional[ModelFacts]
        Detailed facts about the model, including its type, intended use,
        target population, etc. This attribute is optional.
    evaluation_criteria : List[EvaluationCriterion]
        List of evaluation criteria for the model. Each criterion specifies a metric,
        comparison operator, and threshold value.
    evaluation_frequency: Optional[EvaluationFrequency] = None
        The frequency at which the model is evaluated.
    """

    id: str
    endpoints: List[str]
    basic_info: ModelBasicInfo
    facts: Optional[ModelFacts] = None
    evaluation_criteria: List[EvaluationCriterion] = Field(
        default_factory=list, description="List of evaluation criteria"
    )
    evaluation_frequency: Optional[EvaluationFrequency] = None


class EvaluationInput(BaseModel):
    """
    Input data for evaluation.

    Attributes
    ----------
    preds_prob : List[float]
        The predicted probabilities.
    target : List[float]
        The target values.
    metadata : Dict[str, List[Any]]
        Additional metadata for the evaluation.
    timestamp : Optional[datetime]
        Custom timestamp for the evaluation.
    """

    preds_prob: List[float] = Field(..., description="The predicted probabilities")
    target: List[float] = Field(..., description="The target values")
    metadata: Dict[str, List[Any]] = Field(
        ..., description="Additional metadata for the evaluation"
    )
    timestamp: Optional[datetime] = Field(
        None, description="Custom timestamp for the evaluation"
    )

    @validator("timestamp")
    @classmethod
    def validate_timestamp(cls, v: Optional[datetime]) -> Optional[datetime]:
        """
        Validate the timestamp format.

        Parameters
        ----------
        v : Optional[datetime]
            The timestamp value to validate.

        Returns
        -------
        Optional[datetime]
            The validated timestamp.

        Raises
        ------
        ValueError
            If the timestamp format is invalid.
        """
        if v is not None:
            try:
                datetime.fromisoformat(v.isoformat())
            except (ValueError, AttributeError) as err:
                raise ValueError(
                    "Invalid timestamp format. Please use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."
                ) from err
        return v

    @validator("preds_prob", "target")
    @classmethod
    def validate_list_lengths(
        cls, v: List[float], values: Dict[str, Any], field: str
    ) -> List[float]:
        """
        Validate that preds_prob and target have the same length.

        Parameters
        ----------
        v : List[float]
            The list to validate.
        values : Dict[str, Any]
            The dict of values already validated.
        field : str
            The name of the field being validated.

        Returns
        -------
        List[float]
            The validated list.

        Raises
        ------
        ValueError
            If the lengths of preds_prob and target are not the same.
        """
        if (
            "preds_prob" in values
            and "target" in values
            and len(values["preds_prob"]) != len(values["target"])
        ):
            raise ValueError(
                "The lengths of 'preds_prob' and 'target' must be the same."
            )
        return v

    @validator("metadata")
    @classmethod
    def validate_metadata(
        cls, v: Dict[str, List[Any]], values: Dict[str, Any]
    ) -> Dict[str, List[Any]]:
        """
        Validate that all metadata lists have the same length as preds_prob.

        Parameters
        ----------
        v : Dict[str, List[Any]]
            The metadata dict to validate.
        values : Dict[str, Any]
            The dict of values already validated.

        Returns
        -------
        Dict[str, List[Any]]
            The validated metadata dict.

        Raises
        ------
        ValueError
            If any metadata list has a different length than preds_prob.
        """
        if "preds_prob" in values:
            expected_length = len(values["preds_prob"])
            for key, value in v.items():
                if len(value) != expected_length:
                    raise ValueError(
                        f"The length of metadata '{key}' must match the length of 'preds_prob'."
                    )
        return v


class EvaluationResult(BaseModel):
    """
    Evaluation result for an endpoint.

    Attributes
    ----------
    metrics : List[str]
        List of metric names.
    subgroups : List[str]
        List of subgroup names.
    evaluation_result : Dict[str, Any]
        The evaluation result dictionary.
    timestamp : datetime
        Timestamp of the evaluation.
    sample_size : int
        The sample size used for evaluation.
    """

    metrics: List[str]
    subgroups: List[str]
    evaluation_result: Dict[str, Any]
    timestamp: datetime
    sample_size: int

    @validator("evaluation_result", pre=True)
    @classmethod
    def process_evaluation_result(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Process the evaluation result dictionary."""
        result = deep_convert_numpy(v)
        if not isinstance(result, dict):
            raise ValueError("Returned Evaluation result must be a dictionary!")
        return result


class EndpointLog(BaseModel):
    """
    Represents a log entry for an endpoint.

    Attributes
    ----------
    timestamp : datetime
        The timestamp of the log entry.
    action : str
        The action performed.
    details : Optional[Dict[str, str]]
        Additional details about the action.
    endpoint_name : str
        The name of the endpoint associated with this log.
    """

    timestamp: datetime
    action: str
    details: Optional[Dict[str, str]] = None
    endpoint_name: str


class EndpointData(BaseModel):
    """
    Data for an endpoint, including configuration, evaluation history, and logs.

    Attributes
    ----------
    config : EndpointConfig
        Configuration of the endpoint.
    evaluation_history : Dict[str, List[EvaluationResult]]
        List of evaluation results of each model.
    logs : List[EndpointLog]
        List of log entries.
    models : List[str]
        List of models associated with this endpoint.
    """

    config: EndpointConfig
    evaluation_history: Dict[str, List[EvaluationResult]] = {}
    logs: List[EndpointLog] = []
    models: List[str] = []


class EndpointDetails(BaseModel):
    """
    Details for an evaluation endpoint.

    Attributes
    ----------
    name : str
        The unique name of the endpoint.
    metrics : List[str]
        List of metric names configured for this endpoint.
    models : List[str]
        List of model names associated with this endpoint.
    """

    name: str
    metrics: List[str]
    models: List[str]


class Metric(BaseModel):
    """
    Represents a single metric with its associated data.

    Attributes
    ----------
    name : str
        The name of the metric.
    display_name : str
        The display name of the metric.
    type : str
        The type of the metric (binary or multiclass).
    slice : str
        The slice or segment of data the metric represents.
    tooltip : str
        A brief description or explanation of the metric.
    value : float
        The current value of the metric.
    threshold : float
        The threshold value for the metric.
    passed : bool
        Indicates whether the metric passed the threshold.
    history : List[float]
        Historical values of the metric.
    timestamps : List[str]
        Timestamps corresponding to the historical values.
    sample_sizes : List[int]
        Sample sizes corresponding to the historical values.
    status : str = "not met"
        The status of the metric (met or not met).
    """

    name: str
    display_name: str
    type: str
    slice: str
    tooltip: str
    value: float
    threshold: float = Field(default=0.6)
    passed: bool
    history: List[float]
    timestamps: List[str]
    sample_sizes: List[int]
    status: str = "not met"


class MetricCards(BaseModel):
    """
    Represents a collection of metric cards.

    Attributes
    ----------
    metrics : List[str]
        List of metric names.
    display_names : List[str]
        List of display names for each metric.
    tooltips : List[str]
        List of tooltips for each metric.
    slices : List[str]
        List of data slices.
    collection : List[Metric]
        Collection of individual metrics.
    """

    metrics: List[str]
    display_names: List[str]
    tooltips: List[str]
    slices: List[str]
    collection: List[Metric]


class Overview(BaseModel):
    """
    Represents an overview of performance metrics.

    Attributes
    ----------
    last_n_evals : int
        Number of recent evaluations.
    mean_std_min_evals : int
        Minimum number of evaluations required to calculate mean and standard deviation.
    metric_cards : MetricCards
        Collection of metric cards.
    has_data : bool
        Indicates whether there is evaluation data available.
    """

    last_n_evals: int
    mean_std_min_evals: int
    metric_cards: MetricCards
    has_data: bool


class PerformanceData(BaseModel):
    """
    Represents the overall performance data.

    Attributes
    ----------
    overview : Overview
        Overview of performance metrics.
    """

    overview: Overview


class ModelSafety(BaseModel):
    """
    Represents the safety of a model.

    Attributes
    ----------
    metrics : List[Metric]
        A list of individual metrics and their current status.
    last_evaluated : Optional[str]
        A timestamp of when the model was evaluated in ISO 8601 format.
    is_recently_evaluated : bool
        Whether the model was recently evaluated.
    overall_status : str
        The overall status of the model ('No warnings' or 'Warning').
    """

    metrics: List[Metric]
    last_evaluated: Optional[str] = Field(
        ..., description="ISO 8601 formatted date string"
    )
    is_recently_evaluated: bool
    overall_status: str
