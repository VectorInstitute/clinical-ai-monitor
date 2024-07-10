"""Evaluation API functions."""

from typing import Any, Dict, List

import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from cyclops.report.utils import flatten_results_dict
from datasets.arrow_dataset import Dataset
from pydantic import BaseModel, Field


class MetricConfig(BaseModel):
    """Configuration for a metric."""

    name: str = Field(..., description="The name of the metric")
    type: str = Field(..., description="The type of the metric")


class SubgroupConfig(BaseModel):
    """Configuration for a subgroup."""

    name: str = Field(..., description="The name of the subgroup")
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


class EvaluationInput(BaseModel):
    """Input data for evaluation."""

    preds_prob: List[float] = Field(..., description="The predicted probabilities")
    target: List[float] = Field(..., description="The target values")
    metadata: Dict[str, List[Any]] = Field(
        ..., description="Additional metadata for the evaluation"
    )

    @classmethod
    def check_list_length(cls, v: List[Any]) -> List[Any]:
        """Validate that the list is not empty."""
        if len(v) == 0:
            raise ValueError("List must not be empty")
        return v

    @classmethod
    def check_metadata(cls, v: Dict[str, List[Any]]) -> Dict[str, List[Any]]:
        """Validate that the metadata is not empty."""
        if not v:
            raise ValueError("Metadata must not be empty")
        return v


class EvaluationResult(BaseModel):
    """Evaluation result for an endpoint."""

    endpoint_name: str
    model_name: str
    metrics: List[str]
    subgroups: List[str]
    evaluation_result: Dict[str, Any]


class EvaluationEndpoint:
    """Evaluation endpoint class."""

    def __init__(self, config: EndpointConfig):
        """Initialize the EvaluationEndpoint."""
        self.config = config
        self.metrics = MetricDict(
            [create_metric(metric.name, experimental=True) for metric in config.metrics]
        )
        self.slice_spec = self._create_slice_spec()
        self.evaluation_history: List[EvaluationResult] = []

    def _create_slice_spec(self) -> SliceSpec:
        """Create a SliceSpec from the subgroup configurations."""
        spec_list = [
            {subgroup.name: {feature: subgroup.condition[feature]}}
            for subgroup in self.config.subgroups
            for feature in subgroup.condition
        ]
        return SliceSpec(spec_list)

    def evaluate(self, data: EvaluationInput) -> EvaluationResult:
        """
        Evaluate the model using the provided input data.

        Parameters
        ----------
        data : EvaluationInput
            The input data for evaluation.

        Returns
        -------
        EvaluationResult
            The evaluation results.
        """
        df = pd.DataFrame(
            {"preds_prob": data.preds_prob, "target": data.target, **data.metadata}
        )
        dataset = Dataset.from_pandas(df)

        result = evaluator.evaluate(
            dataset=dataset,
            metrics=self.metrics,
            slice_spec=self.slice_spec,
            target_columns="target",
            prediction_columns="preds_prob",
        )

        results_flat = flatten_results_dict(results=result)

        evaluation_result = EvaluationResult(
            endpoint_name=self.config.endpoint_name,
            model_name=self.config.model_name,
            metrics=[metric.name for metric in self.metrics.metrics],
            subgroups=[subgroup.name for subgroup in self.config.subgroups],
            evaluation_result=results_flat,
        )

        self.evaluation_history.append(evaluation_result)
        return evaluation_result


evaluation_endpoints: Dict[str, EvaluationEndpoint] = {}


def create_evaluation_endpoint(config: EndpointConfig) -> Dict[str, str]:
    """
    Create a new evaluation endpoint configuration.

    Parameters
    ----------
    config : EndpointConfig
        The configuration for the new evaluation endpoint.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If an endpoint with the given name already exists.
    """
    if config.endpoint_name in evaluation_endpoints:
        raise ValueError(f"Endpoint with name '{config.endpoint_name}' already exists")

    evaluation_endpoints[config.endpoint_name] = EvaluationEndpoint(config)
    return {
        "message": f"Evaluation endpoint '{config.endpoint_name}' created successfully"
    }


def delete_evaluation_endpoint(endpoint_name: str) -> Dict[str, str]:
    """
    Delete an evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the endpoint with the given name doesn't exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")

    del evaluation_endpoints[endpoint_name]
    return {"message": f"Evaluation endpoint '{endpoint_name}' deleted successfully"}


def list_evaluation_endpoints() -> Dict[str, List[Dict[str, str]]]:
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[Dict[str, str]]]
        A dictionary containing a list of endpoint details.
    """
    return {
        "endpoints": [
            {
                "endpoint_name": name,
                "model_name": endpoint.config.model_name,
                "model_description": endpoint.config.model_description,
            }
            for name, endpoint in evaluation_endpoints.items()
        ]
    }


def evaluate_model(endpoint_name: str, data: EvaluationInput) -> EvaluationResult:
    """
    Evaluate a model using the specified evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to use.
    data : EvaluationInput
        The input data for evaluation.

    Returns
    -------
    EvaluationResult
        The evaluation results.

    Raises
    ------
    ValueError
        If the specified endpoint does not exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")

    endpoint = evaluation_endpoints[endpoint_name]
    return endpoint.evaluate(data)
