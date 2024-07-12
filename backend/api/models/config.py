"""Configurations."""

from typing import Any, Dict, List

from pydantic import BaseModel, Field, validator

from backend.api.models.constants import VALID_METRIC_NAMES


class MetricConfig(BaseModel):
    """Configuration for a metric."""

    name: str = Field(..., description="The name of the metric")
    type: str = Field(..., description="The type of the metric")

    @validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        """Validate the metric type."""
        if v not in ["binary", "multilabel", "multiclass"]:
            raise ValueError("Type must be binary, multilabel, or multiclass")
        return v

    @validator("name")
    @classmethod
    def validate_name(cls, v: str, values: Dict[str, Any]) -> str:
        """Validate the metric name."""
        if "type" in values:
            full_name = f"{values['type']}_{v}"
            if full_name not in VALID_METRIC_NAMES:
                raise ValueError(f"Invalid metric: {full_name}")
        return v


class SubgroupConfig(BaseModel):
    """Configuration for a subgroup."""

    column: str = Field(..., description="The column name for the subgroup")
    condition: Dict[str, Any] = Field(
        ..., description="The condition defining the subgroup"
    )


class EndpointConfig(BaseModel):
    """Configuration for an evaluation endpoint."""

    endpoint_name: str = Field(..., description="The name of the evaluation endpoint")
    model_name: str = Field(..., description="The name of the model")
    model_description: str = Field(..., description="A description of the model")
    metrics: List[MetricConfig] = Field(
        ..., description="A list of metric configurations"
    )
    subgroups: List[SubgroupConfig] = Field(
        default=[], description="A list of subgroup configurations"
    )

    @validator("metrics")
    @classmethod
    def validate_metrics(cls, v: List[MetricConfig]) -> List[MetricConfig]:
        """Validate the list of metrics."""
        if len(v) == 0:
            raise ValueError("At least one metric is required")
        return v
