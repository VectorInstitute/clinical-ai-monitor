"""Evaluation API functions."""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from datasets.arrow_dataset import Dataset

from api.models.config import EndpointConfig, ModelConfig, SubgroupCondition
from api.models.data import (
    EndpointData,
    EndpointDetails,
    EndpointLog,
    EvaluationInput,
    EvaluationResult,
)
from api.models.utils import deep_convert_numpy


# Define the path for storing endpoint data
DATA_DIR = Path("endpoint_data")
DATA_DIR.mkdir(exist_ok=True)


class EvaluationEndpoint:
    """Evaluation endpoint class."""

    def __init__(self, config: EndpointConfig, name: str):
        """
        Initialize the EvaluationEndpoint.

        Parameters
        ----------
        config : EndpointConfig
            The configuration for the evaluation endpoint.
        name : str
            The unique name for the endpoint.
        """
        self.config = config
        self.name = name
        self.metrics: MetricDict = MetricDict(
            {
                f"{metric.type}_{metric.name}": create_metric(
                    f"{metric.type}_{metric.name}", experimental=True
                )
                for metric in config.metrics
            }
        )
        self.slice_spec = self._create_slice_spec()
        self.data = self._load_data() or EndpointData(config=config)
        self._save_data()

    def _create_slice_spec(self) -> SliceSpec:
        """
        Create a SliceSpec from the subgroup configurations.

        Returns
        -------
        SliceSpec
            The created slice specification.
        """
        spec_list = []
        for subgroup in self.config.subgroups:
            condition_dict = self._convert_condition_to_dict(subgroup.condition)
            spec_list.append({subgroup.column: condition_dict})
        return SliceSpec(spec_list)

    @staticmethod
    def _convert_condition_to_dict(condition: SubgroupCondition) -> Dict[str, Any]:
        """
        Convert SubgroupCondition to a dictionary compatible with SliceSpec.

        Parameters
        ----------
        condition : SubgroupCondition
            The subgroup condition to convert.

        Returns
        -------
        Dict[str, Any]
            The converted condition dictionary.

        Raises
        ------
        ValueError
            If the condition is invalid or missing required values.
        """
        condition_dict: Dict[str, Any] = {"type": condition.type.value}
        if condition.type == "range":
            if condition.min_value is None and condition.max_value is None:
                raise ValueError("Range condition must have a min_value or max_value")
            if condition.min_value is not None:
                condition_dict["min_value"] = condition.min_value
            if condition.max_value is not None:
                condition_dict["max_value"] = condition.max_value
        elif condition.type in ["value", "contains", "year", "month", "day"]:
            if condition.value is None:
                raise ValueError(
                    f"{condition.type.capitalize()} condition must have a value"
                )
            condition_dict["value"] = condition.value
        else:
            raise ValueError(f"Invalid condition type: {condition.type}")
        return condition_dict

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
        df["target"] = df["target"].astype(int)
        dataset = Dataset.from_pandas(df)
        result = evaluator.evaluate(
            dataset=dataset,
            metrics=self.metrics,
            slice_spec=self.slice_spec,
            target_columns="target",
            prediction_columns="preds_prob",
        )

        # Extract unique slices from the evaluation result
        slices = list(result["model_for_preds_prob"].keys())
        sample_size = len(data.preds_prob)

        # Use the provided timestamp or default to current time
        evaluation_timestamp = data.timestamp or datetime.now()

        evaluation_result = EvaluationResult(
            metrics=[f"{metric.type}_{metric.name}" for metric in self.config.metrics],
            subgroups=slices,
            evaluation_result=result,
            timestamp=evaluation_timestamp,
            sample_size=sample_size,
        )
        self.data.evaluation_history.append(evaluation_result)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="evaluated",
                endpoint_name=self.name,
            )
        )
        self._save_data()
        return evaluation_result.dict()

    def _load_data(self) -> Optional[EndpointData]:
        """Load endpoint data from JSON file."""
        file_path = DATA_DIR / f"{self.name}.json"
        if file_path.exists():
            with open(file_path, "r") as f:
                data = json.load(f)
            return EndpointData(**data)
        return None

    def _save_data(self) -> None:
        """Save endpoint data to JSON file."""
        file_path = DATA_DIR / f"{self.name}.json"
        serializable_data = self.data.dict()
        with open(file_path, "w") as f:
            json.dump(deep_convert_numpy(serializable_data), f)

    def add_model(self, model: ModelConfig) -> None:
        """
        Add a model to the endpoint.

        Parameters
        ----------
        model : ModelConfig
            The model configuration to add.
        """
        self.data.models.append(model)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="added_model",
                details={"model_name": model.name},
                endpoint_name=self.name,
            )
        )
        self._save_data()

    def remove_model(self, model_name: str) -> None:
        """
        Remove a model from the endpoint.

        Parameters
        ----------
        model_name : str
            The name of the model to remove.

        Raises
        ------
        ValueError
            If the model is not found.
        """
        for i, model in enumerate(self.data.models):
            if model.name == model_name:
                del self.data.models[i]
                self.data.logs.append(
                    EndpointLog(
                        timestamp=datetime.now(),
                        action="removed_model",
                        details={"model_name": model_name},
                        endpoint_name=self.name,
                    )
                )
                self._save_data()
                return
        raise ValueError(f"Model '{model_name}' not found in endpoint '{self.name}'")

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
        config = EndpointConfig(**data["config"])
        endpoint = cls(config, endpoint_name)
        endpoint.data = EndpointData(**data)
        return endpoint


def load_all_endpoints() -> Dict[str, EvaluationEndpoint]:
    """
    Load all endpoints from JSON files.

    Returns
    -------
    Dict[str, EvaluationEndpoint]
        A dictionary of all loaded endpoints.
    """
    endpoints: Dict[str, EvaluationEndpoint] = {}
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
        A dictionary containing a success message or an error message.
    """
    try:
        endpoint_name = f"endpoint_{uuid.uuid4().hex[:8]}"
        endpoint = EvaluationEndpoint(config, endpoint_name)
        evaluation_endpoints[endpoint_name] = endpoint
        return {
            "message": f"Evaluation endpoint '{endpoint_name}' created successfully",
            "endpoint_name": endpoint_name,
        }
    except Exception as e:
        return {"error": str(e)}


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

    Notes
    -----
    This function removes the endpoint from the in-memory dictionary and
    deletes the corresponding JSON file from the disk.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")

    # Remove the endpoint from the in-memory dictionary
    del evaluation_endpoints[endpoint_name]

    # Delete the corresponding JSON file
    file_path = DATA_DIR / f"{endpoint_name}.json"
    if file_path.exists():
        file_path.unlink()

    return {"message": f"Evaluation endpoint '{endpoint_name}' deleted successfully"}


def list_evaluation_endpoints() -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of endpoint details.

    Notes
    -----
    This function returns details about each endpoint, including its name,
    configured metrics, and associated models.
    """
    return {
        "endpoints": [
            EndpointDetails(
                name=name,
                metrics=[
                    f"{metric.type}_{metric.name}" for metric in endpoint.config.metrics
                ],
                models=[model.name for model in endpoint.data.models],
            )
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

    Notes
    -----
    This function uses the endpoint configuration to evaluate the provided data.
    It no longer assumes any specific model is associated with the endpoint.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")
    endpoint = evaluation_endpoints[endpoint_name]
    return endpoint.evaluate(data)


def get_endpoint_logs() -> List[EndpointLog]:
    """
    Get logs for all endpoints.

    Returns
    -------
    List[EndpointLog]
        A list of logs for all endpoints, sorted by timestamp in descending order.

    Notes
    -----
    This function collects logs from all endpoints and sorts them by timestamp,
    with the most recent logs first.
    """
    all_logs = []
    for endpoint_name, endpoint in evaluation_endpoints.items():
        endpoint_logs = [
            EndpointLog(
                timestamp=log.timestamp,
                action=log.action,
                details=log.details,
                endpoint_name=endpoint_name,
            )
            for log in endpoint.data.logs
        ]
        all_logs.extend(endpoint_logs)

    # Sort logs by timestamp in descending order (most recent first)
    all_logs.sort(key=lambda x: x.timestamp, reverse=True)

    return all_logs
