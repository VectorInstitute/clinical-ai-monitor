"""Evaluation API functions."""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from cyclops.report.utils import flatten_results_dict
from datasets.arrow_dataset import Dataset
from pydantic import BaseModel, Field, validator

from backend.api.models.config import EndpointConfig


# Define the path for storing endpoint data
DATA_DIR = Path("endpoint_data")
DATA_DIR.mkdir(exist_ok=True)


class EvaluationInput(BaseModel):
    """Input data for evaluation."""

    preds_prob: List[float] = Field(..., description="The predicted probabilities")
    target: List[float] = Field(..., description="The target values")
    metadata: Dict[str, List[Any]] = Field(
        ..., description="Additional metadata for the evaluation"
    )


def deep_convert_numpy(obj: Any) -> Any:  # noqa: PLR0911
    """
    Recursively convert numpy types to Python native types.

    Parameters
    ----------
    obj : Any
        The object to convert.

    Returns
    -------
    Any
        The converted object.
    """
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {key: deep_convert_numpy(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [deep_convert_numpy(item) for item in obj]
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


class EvaluationResult(BaseModel):
    """Evaluation result for an endpoint."""

    endpoint_name: str
    model_name: str
    metrics: List[str]
    subgroups: List[str]
    evaluation_result: Dict[str, Any]
    timestamp: datetime

    @validator("evaluation_result", pre=True)
    @classmethod
    def process_evaluation_result(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten the nested evaluation result dictionary and convert numpy types.

        Parameters
        ----------
        v : Dict[str, Any]
            The nested evaluation result dictionary.

        Returns
        -------
        Dict[str, Any]
            The flattened evaluation result dictionary with converted numpy types.
        """
        flattened = flatten_results_dict(v)
        return deep_convert_numpy(flattened)


class EndpointLog(BaseModel):
    """Log entry for an endpoint."""

    timestamp: datetime
    action: str
    details: Optional[Dict[str, Any]] = None


class EndpointData(BaseModel):
    """Data for an endpoint, including configuration, evaluation history, and logs."""

    config: EndpointConfig
    evaluation_history: List[EvaluationResult] = []
    logs: List[EndpointLog] = []


class EvaluationEndpoint:
    """Evaluation endpoint class."""

    def __init__(self, config: EndpointConfig) -> None:
        """
        Initialize the EvaluationEndpoint.

        Parameters
        ----------
        config : EndpointConfig
            The configuration for the evaluation endpoint.
        """
        self.config = config
        self.metrics = MetricDict(
            [
                create_metric(f"{metric.type}_{metric.name}", experimental=True)
                for metric in config.metrics
            ]
        )
        self.slice_spec = self._create_slice_spec()
        self.data = EndpointData(config=config)
        self._save_data()

    def _create_slice_spec(self) -> SliceSpec:
        """
        Create a SliceSpec from the subgroup configurations.

        Returns
        -------
        SliceSpec
            The created slice specification.
        """
        spec_list = [
            {subgroup.column: subgroup.condition} for subgroup in self.config.subgroups
        ]
        return SliceSpec(spec_list)

    def evaluate(self, data: EvaluationInput) -> Dict[str, Any]:
        """
        Evaluate the model using the provided input data.

        Parameters
        ----------
        data : EvaluationInput
            The input data for evaluation.

        Returns
        -------
        Dict[str, Any]
            The serialized evaluation results.
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
        evaluation_result = EvaluationResult(
            endpoint_name=self.config.endpoint_name,
            model_name=self.config.model_name,
            metrics=[f"{metric.type}_{metric.name}" for metric in self.config.metrics],
            subgroups=[subgroup.column for subgroup in self.config.subgroups],
            evaluation_result=result,
            timestamp=datetime.now(),
        )
        self.data.evaluation_history.append(evaluation_result)
        self.data.logs.append(EndpointLog(timestamp=datetime.now(), action="evaluated"))
        self._save_data()
        return evaluation_result.dict()

    def _save_data(self) -> None:
        """Save endpoint data to JSON file."""
        file_path = DATA_DIR / f"{self.config.endpoint_name}.json"
        with open(file_path, "w") as f:
            json.dump(deep_convert_numpy(self.data.dict()), f)

    @classmethod
    def load(cls, endpoint_name: str) -> "EvaluationEndpoint":
        """
        Load endpoint data from JSON file.

        Parameters
        ----------
        endpoint_name : str
            The name of the endpoint to load.

        Returns
        -------
        EvaluationEndpoint
            The loaded evaluation endpoint.

        Raises
        ------
        ValueError
            If the endpoint file is not found.
        """
        file_path = DATA_DIR / f"{endpoint_name}.json"
        if not file_path.exists():
            raise ValueError(f"Endpoint '{endpoint_name}' not found")
        with open(file_path, "r") as f:
            data = json.load(f)
        endpoint_data = EndpointData(**data)
        endpoint = cls(endpoint_data.config)
        endpoint.data = endpoint_data
        return endpoint


def load_all_endpoints() -> Dict[str, EvaluationEndpoint]:
    """
    Load all endpoints from JSON files.

    Returns
    -------
    Dict[str, EvaluationEndpoint]
        A dictionary of all loaded endpoints.
    """
    endpoints = {}
    for file_path in DATA_DIR.glob("*.json"):
        endpoint_name = file_path.stem
        try:
            endpoint = EvaluationEndpoint.load(endpoint_name)
            endpoints[endpoint_name] = endpoint
        except Exception as e:
            print(f"Error loading endpoint {endpoint_name}: {str(e)}")
    return endpoints


evaluation_endpoints: Dict[str, EvaluationEndpoint] = load_all_endpoints()


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
    print(config)
    if config.endpoint_name in evaluation_endpoints:
        raise ValueError(f"Endpoint with name '{config.endpoint_name}' already exists")
    endpoint = EvaluationEndpoint(config)
    evaluation_endpoints[config.endpoint_name] = endpoint
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
    file_path = DATA_DIR / f"{endpoint_name}.json"
    if file_path.exists():
        file_path.unlink()
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


def evaluate_model(endpoint_name: str, data: EvaluationInput) -> Dict[str, Any]:
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
    Dict[str, Any]
        The serialized evaluation results.

    Raises
    ------
    ValueError
        If the specified endpoint does not exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")
    endpoint = evaluation_endpoints[endpoint_name]
    return endpoint.evaluate(data)


def get_endpoint_logs(endpoint_name: str) -> List[EndpointLog]:
    """
    Get logs for a specific endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint.

    Returns
    -------
    List[EndpointLog]
        A list of logs for the specified endpoint.

    Raises
    ------
    ValueError
        If the specified endpoint does not exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")
    endpoint = evaluation_endpoints[endpoint_name]
    return endpoint.data.logs
