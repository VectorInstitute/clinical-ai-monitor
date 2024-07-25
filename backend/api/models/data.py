"""Dataclasses for evaluation input and output."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator

from api.models.config import EndpointConfig, ModelConfig
from api.models.utils import deep_convert_numpy


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
        return deep_convert_numpy(v)


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
    evaluation_history : List[EvaluationResult]
        List of evaluation results.
    logs : List[EndpointLog]
        List of log entries.
    models : List[ModelConfig]
        List of models associated with this endpoint.
    """

    config: EndpointConfig
    evaluation_history: List[EvaluationResult] = []
    logs: List[EndpointLog] = []
    models: List[ModelConfig] = []


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
