"""Configuration API for evaluation servers."""

from typing import Any, Dict, List

import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from cyclops.report.utils import flatten_results_dict
from datasets.arrow_dataset import Dataset
from pydantic import BaseModel, Field, validator


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

    @validator("preds_prob", "target")
    def check_list_length(cls, v):
        if len(v) == 0:
            raise ValueError("List must not be empty")
        return v

    @validator("metadata")
    def check_metadata(cls, v):
        if not v:
            raise ValueError("Metadata must not be empty")
        return v


class EvaluationServer:
    def __init__(self, config: ServerConfig):
        self.config = config
        self.metrics = MetricDict(
            [create_metric(metric.name, experimental=True) for metric in config.metrics]
        )
        self.slice_spec = self._create_slice_spec()

    def _create_slice_spec(self) -> SliceSpec:
        spec_list = []
        for subgroup in self.config.subgroups:
            feature = list(subgroup.condition.keys())[0]
            spec = {feature: subgroup.condition[feature]}
            spec_list.append({subgroup.name: spec})
        return SliceSpec(spec_list)


evaluation_servers: Dict[str, EvaluationServer] = {}


def create_evaluation_server(config: ServerConfig) -> Dict[str, str]:
    """Create a new evaluation server configuration."""
    if config.server_name in evaluation_servers:
        raise ValueError(f"Server with name '{config.server_name}' already exists")

    evaluation_servers[config.server_name] = EvaluationServer(config)
    return {"message": f"Evaluation server '{config.server_name}' created successfully"}


def delete_evaluation_server(server_name: str) -> Dict[str, str]:
    """Delete an evaluation server configuration."""
    if server_name not in evaluation_servers:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    del evaluation_servers[server_name]
    return {"message": f"Evaluation server '{server_name}' deleted successfully"}


def list_evaluation_servers() -> Dict[str, List[Dict[str, str]]]:
    """List all created evaluation servers."""
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


def evaluate_model(server_name: str, data: EvaluationInput) -> Dict[str, Any]:
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
    Dict[str, Any]
        The evaluation results.

    Raises
    ------
    ValueError
        If the specified server does not exist.
    """
    if server_name not in evaluation_servers:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    server = evaluation_servers[server_name]

    # Create a DataFrame from the input data
    df = pd.DataFrame(
        {"preds_prob": data.preds_prob, "target": data.target, **data.metadata}
    )

    # Create a Dataset object from the DataFrame
    dataset = Dataset.from_pandas(df)

    # Evaluate the model
    result = evaluator.evaluate(
        dataset=dataset,
        metrics=server.metrics,
        slice_spec=server.slice_spec,
        target_columns="target",
        prediction_columns="preds_prob",
    )

    # Flatten the results
    results_flat = flatten_results_dict(results=result)

    # Prepare the final result
    final_result = {
        "server_name": server_name,
        "model_name": server.config.model_name,
        "metrics": [metric.name for metric in server.metrics.metrics],
        "subgroups": [subgroup.name for subgroup in server.config.subgroups],
        "evaluation_result": results_flat,
    }

    return final_result
