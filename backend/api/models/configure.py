"""Configuration API for evaluation servers."""

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


class ServerConfig(BaseModel):
    """Configuration for an evaluation server."""

    server_name: str = Field(..., description="The name of the evaluation server")
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
    """Evaluation result for a server."""

    server_name: str
    model_name: str
    metrics: List[str]
    subgroups: List[str]
    evaluation_result: Dict[str, Any]


class EvaluationServer:
    """Evaluation server class."""

    def __init__(self, config: ServerConfig):
        """Initialize the EvaluationServer."""
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
            server_name=self.config.server_name,
            model_name=self.config.model_name,
            metrics=[metric.name for metric in self.metrics.metrics],
            subgroups=[subgroup.name for subgroup in self.config.subgroups],
            evaluation_result=results_flat,
        )

        self.evaluation_history.append(evaluation_result)
        return evaluation_result


evaluation_servers: Dict[str, EvaluationServer] = {}


def create_evaluation_server(config: ServerConfig) -> Dict[str, str]:
    """
    Create a new evaluation server configuration.

    Parameters
    ----------
    config : ServerConfig
        The configuration for the new evaluation server.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If a server with the given name already exists.
    """
    if config.server_name in evaluation_servers:
        raise ValueError(f"Server with name '{config.server_name}' already exists")

    evaluation_servers[config.server_name] = EvaluationServer(config)
    return {"message": f"Evaluation server '{config.server_name}' created successfully"}


def delete_evaluation_server(server_name: str) -> Dict[str, str]:
    """
    Delete an evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the server with the given name doesn't exist.
    """
    if server_name not in evaluation_servers:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    del evaluation_servers[server_name]
    return {"message": f"Evaluation server '{server_name}' deleted successfully"}


def list_evaluation_servers() -> Dict[str, List[Dict[str, str]]]:
    """
    List all created evaluation servers.

    Returns
    -------
    Dict[str, List[Dict[str, str]]]
        A dictionary containing a list of server details.
    """
    return {
        "servers": [
            {
                "server_name": name,
                "model_name": server.config.model_name,
                "model_description": server.config.model_description,
            }
            for name, server in evaluation_servers.items()
        ]
    }


def evaluate_model(server_name: str, data: EvaluationInput) -> EvaluationResult:
    """
    Evaluate a model using the specified evaluation server configuration.

    Parameters
    ----------
    server_name : str
        The name of the evaluation server to use.
    data : EvaluationInput
        The input data for evaluation.

    Returns
    -------
    EvaluationResult
        The evaluation results.

    Raises
    ------
    ValueError
        If the specified server does not exist.
    """
    if server_name not in evaluation_servers:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    server = evaluation_servers[server_name]
    return server.evaluate(data)
