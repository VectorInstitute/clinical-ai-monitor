"""Configurations for evaluation endpoints and metrics."""

from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, root_validator, validator

from api.models.constants import VALID_METRIC_NAMES


class ModelConfig(BaseModel):
    """
    Configuration for a model.

    Attributes
    ----------
    name : str
        The name of the model.
    description : str
        The description of the model.
    """

    name: str = Field(..., description="The name of the model")
    description: str = Field(..., description="The description of the model")


class MetricConfig(BaseModel):
    """
    Configuration for a metric.

    Attributes
    ----------
    name : str
        The name of the metric.
    type : str
        The type of the metric (binary, multilabel, or multiclass).
    """

    name: str = Field(..., description="The name of the metric")
    type: str = Field(..., description="The type of the metric")

    @validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        """
        Validate the metric type.

        Parameters
        ----------
        v : str
            The metric type to validate.

        Returns
        -------
        str
            The validated metric type.

        Raises
        ------
        ValueError
            If the metric type is not valid.
        """
        if v not in ["binary", "multilabel", "multiclass"]:
            raise ValueError("Type must be binary, multilabel, or multiclass")
        return v

    @validator("name")
    @classmethod
    def validate_name(cls, v: str, values: Dict[str, Any]) -> str:
        """
        Validate the metric name.

        Parameters
        ----------
        v : str
            The metric name to validate.
        values : Dict[str, Any]
            The current values of the model.

        Returns
        -------
        str
            The validated metric name.

        Raises
        ------
        ValueError
            If the metric name is not valid.
        """
        if "type" in values:
            full_name = f"{values['type']}_{v}"
            if full_name not in VALID_METRIC_NAMES:
                raise ValueError(f"Invalid metric: {full_name}")
        return v


class ConditionType(str, Enum):
    """
    Enumeration of condition types for subgroup configuration.

    Attributes
    ----------
    VALUE : str
        Exact value condition.
    RANGE : str
        Range condition.
    CONTAINS : str
        Contains condition.
    YEAR : str
        Year condition for date fields.
    MONTH : str
        Month condition for date fields.
    DAY : str
        Day condition for date fields.
    """

    VALUE = "value"
    RANGE = "range"
    CONTAINS = "contains"
    YEAR = "year"
    MONTH = "month"
    DAY = "day"


class SubgroupCondition(BaseModel):
    """
    Model for subgroup condition.

    Attributes
    ----------
    type : ConditionType
        The type of the condition.
    value : Optional[Union[str, int, float]]
        The value for the condition (for non-range types).
    min_value : Optional[float]
        The minimum value for range conditions.
    max_value : Optional[float]
        The maximum value for range conditions.
    """

    type: ConditionType
    value: Optional[Union[str, int, float]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None

    @root_validator
    @classmethod
    def validate_condition(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the condition structure based on its type.

        Parameters
        ----------
        values : Dict[str, Any]
            The current values of the model.

        Returns
        -------
        Dict[str, Any]
            The validated values.

        Raises
        ------
        ValueError
            If the condition structure is invalid.
        """
        condition_type = values.get("type")
        if (
            condition_type == ConditionType.RANGE
            and values.get("min_value") is None
            and values.get("max_value") is None
        ):
            raise ValueError(
                "Range condition must have at least min_value or max_value"
            )
        if (
            condition_type
            in [
                ConditionType.VALUE,
                ConditionType.CONTAINS,
                ConditionType.YEAR,
                ConditionType.MONTH,
                ConditionType.DAY,
            ]
            and values.get("value") is None
        ):
            raise ValueError(
                f"{condition_type.capitalize()} condition must have a value"
            )
        return values


class SubgroupConfig(BaseModel):
    """
    Configuration for a subgroup.

    Attributes
    ----------
    column : str
        The column name for the subgroup.
    condition : SubgroupCondition
        The condition defining the subgroup.
    """

    column: str = Field(..., description="The column name for the subgroup")
    condition: SubgroupCondition = Field(
        ..., description="The condition defining the subgroup"
    )

    class Config:
        """Configuration class for SubgroupConfig."""

        schema_extra = {
            "example": {
                "column": "age",
                "condition": {"type": "range", "min_value": 18, "max_value": 65},
            }
        }

    @property
    def type(self) -> ConditionType:
        """Get the condition type."""
        return self.condition.type

    @property
    def value(self) -> Optional[Union[str, int, float]]:
        """Get the condition value."""
        return self.condition.value

    @property
    def min_value(self) -> Optional[float]:
        """Get the minimum value for range conditions."""
        return self.condition.min_value

    @property
    def max_value(self) -> Optional[float]:
        """Get the maximum value for range conditions."""
        return self.condition.max_value


class EndpointConfig(BaseModel):
    """
    Configuration for an evaluation endpoint.

    Attributes
    ----------
    metrics : List[MetricConfig]
        A list of metric configurations.
    subgroups : List[SubgroupConfig]
        A list of subgroup configurations.
    """

    metrics: List[MetricConfig] = Field(
        ..., description="A list of metric configurations"
    )
    subgroups: List[SubgroupConfig] = Field(
        default=[], description="A list of subgroup configurations"
    )

    @validator("metrics")
    @classmethod
    def validate_metrics(cls, v: List[MetricConfig]) -> List[MetricConfig]:
        """
        Validate the list of metrics.

        Parameters
        ----------
        v : List[MetricConfig]
            The list of metrics to validate.

        Returns
        -------
        List[MetricConfig]
            The validated list of metrics.

        Raises
        ------
        ValueError
            If no metrics are provided.
        """
        if len(v) == 0:
            raise ValueError("At least one metric is required")
        return v
