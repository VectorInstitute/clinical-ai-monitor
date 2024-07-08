"""Configuration models and functions for evaluation servers."""

from typing import Any, Dict, List

from cyclops.data.slicer import SliceSpec
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from pydantic import BaseModel


class MetricConfig(BaseModel):
    """Configuration for a metric."""

    name: str
    type: str


class SubgroupConfig(BaseModel):
    """Configuration for a subgroup."""

    name: str
    condition: Dict[str, Any]


class ServerConfig(BaseModel):
    """Configuration for an evaluation server."""

    server_name: str
    model_name: str
    model_description: str
    metrics: List[MetricConfig]
    subgroups: List[SubgroupConfig]


class EvaluationInput(BaseModel):
    """Input data for evaluation."""

    preds_prob: List[float]
    target: List[float]
    metadata: Dict[str, List[Any]]


# Dictionary to store evaluation configurations
evaluation_configs: Dict[str, Dict[str, Any]] = {}


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
    if config.server_name in evaluation_configs:
        raise ValueError(f"Server with name '{config.server_name}' already exists")

    metrics = [
        create_metric(metric.name, experimental=True) for metric in config.metrics
    ]
    metric_collection = MetricDict(metrics)

    spec_list = [{subgroup.name: subgroup.condition} for subgroup in config.subgroups]
    slice_spec = SliceSpec(spec_list)

    evaluation_configs[config.server_name] = {
        "model_name": config.model_name,
        "model_description": config.model_description,
        "metrics": metric_collection,
        "slice_spec": slice_spec,
    }

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
    if server_name not in evaluation_configs:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    del evaluation_configs[server_name]
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
                "model_name": config["model_name"],
                "model_description": config["model_description"],
            }
            for name, config in evaluation_configs.items()
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
    if server_name not in evaluation_configs:
        raise ValueError(f"Evaluation server '{server_name}' not found")

    config = evaluation_configs[server_name]

    # Here, you would implement the actual evaluation logic using the config and input data
    # For this example, we'll just return a dummy result
    result = {
        "server_name": server_name,
        "model_name": config["model_name"],
        "metrics": [metric.name for metric in config["metrics"].metrics],
        "subgroups": [subgroup for subgroup in config["slice_spec"].spec_list],
        "evaluation_result": "Dummy evaluation result",
    }

    return result
