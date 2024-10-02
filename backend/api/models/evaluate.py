"""Evaluation API functions."""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from datasets.arrow_dataset import Dataset

from api.models.config import EndpointConfig, SubgroupCondition
from api.models.data import (
    EndpointData,
    EndpointDetails,
    EndpointLog,
    EvaluationInput,
    EvaluationResult,
    ModelBasicInfo,
    ModelData,
    _default_data,
)
from api.models.db import DATA_DIR, load_model_data, save_model_data
from api.models.utils import deep_convert_numpy


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

    def evaluate(self, model_id: str, data: EvaluationInput) -> Dict[str, Any]:
        """
        Evaluate the model using the provided input data.

        Parameters
        ----------
        model_id: str
            The ID of the model associated to evaluate.
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
        if model_id not in self.data.evaluation_history:
            self.data.evaluation_history[model_id] = []
        self.data.evaluation_history[model_id].append(evaluation_result)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="evaluated",
                endpoint_name=self.name,
            )
        )
        self._save_data()
        return evaluation_result.dict()  # type: ignore

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

    def add_model(self, model_info: ModelBasicInfo) -> str:
        """
        Add a model to the endpoint.

        Parameters
        ----------
        model_info : ModelBasicInfo
            Basic information about the model to add.

        Returns
        -------
        str
            The unique ID of the newly added model.
        """
        model_id = str(uuid.uuid4())
        metric_name = f"{self.config.metrics[0].type}_{self.config.metrics[0].name}"
        model_facts, evaluation_criterion, evaluation_frequency = _default_data(
            metric_name
        )
        model_data = ModelData(
            id=model_id,
            endpoint_name=self.name,
            basic_info=model_info,
            endpoints=[self.name],
            facts=model_facts,
            evaluation_criterion=evaluation_criterion,
            evaluation_frequency=evaluation_frequency,
        )
        save_model_data(model_id, model_data)
        self.data.models.append(model_id)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="added_model",
                details={"model_name": model_info.name, "model_id": model_id},
                endpoint_name=self.name,
            )
        )
        self._save_data()
        return model_id

    def remove_model(self, model_id: str) -> None:
        """
        Remove a model from the endpoint.

        Parameters
        ----------
        model_id : str
            The ID of the model to remove.

        Raises
        ------
        ValueError
            If the model is not found.
        """
        if model_id not in self.data.models:
            raise ValueError(f"Model '{model_id}' not found in endpoint '{self.name}'")
        self.data.models.remove(model_id)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="removed_model",
                details={"model_id": model_id},
                endpoint_name=self.name,
            )
        )
        self._save_data()

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
    for file_path in DATA_DIR.glob("endpoint_*.json"):
        endpoint_name = file_path.stem
        try:
            endpoint = EvaluationEndpoint.load(endpoint_name)
            endpoints[endpoint_name] = endpoint
        except Exception as e:
            print(f"Error loading endpoint {endpoint_name}: {str(e)}")
    return endpoints


def load_all_models() -> Dict[str, ModelData]:
    """
    Load all models from JSON files.

    Returns
    -------
    Dict[str, ModelData]
        A dictionary with loaded model data.
    """
    models = {}
    for file_path in DATA_DIR.glob("model_*.json"):
        model_id = file_path.stem.replace("model_", "")
        try:
            model_data = load_model_data(model_id)
            if model_data:
                models[model_id] = model_data
        except Exception as e:
            print(f"Error loading model {model_id}: {str(e)}")
    return models


evaluation_endpoints: Dict[str, EvaluationEndpoint] = load_all_endpoints()
models: Dict[str, ModelData] = load_all_models()


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
                models=list(endpoint.data.models),
            )
            for name, endpoint in evaluation_endpoints.items()
        ]
    }


def list_models() -> Dict[str, ModelData]:
    """
    List all models.

    Returns
    -------
    Dict[str, ModelData]
        A dict with all models, with model IDs as keys and ModelData as values.
    """
    return models


def get_model_by_id(model_id: str) -> Optional[ModelData]:
    """
    Get a model's details by its ID.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve.

    Returns
    -------
    Optional[ModelData]
        The model data if found, None otherwise.
    """
    model_data = load_model_data(model_id)
    if model_data:
        return model_data
    return None


def add_model_to_endpoint(
    endpoint_name: str, model_info: ModelBasicInfo
) -> Dict[str, str]:
    """
    Add a model to an existing evaluation endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to add the model to.
    model_info : ModelBasicInfo
        Basic information about the model to be added.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message and the new model ID.

    Raises
    ------
    ValueError
        If the endpoint doesn't exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Endpoint '{endpoint_name}' not found")

    endpoint = evaluation_endpoints[endpoint_name]
    model_id = endpoint.add_model(model_info)

    if model_id in models:
        models[model_id].endpoints.append(endpoint_name)
    else:
        models[model_id] = ModelData(
            id=model_id, endpoints=[endpoint_name], basic_info=model_info, facts=None
        )

    return {
        "message": f"Model '{model_info.name}' added to endpoint '{endpoint_name}' successfully",
        "model_id": model_id,
    }


def remove_model_from_endpoint(endpoint_name: str, model_id: str) -> Dict[str, str]:
    """
    Remove a model from an existing evaluation endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to remove the model from.
    model_id : str
        The ID of the model to be removed.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the endpoint or model doesn't exist.
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Endpoint '{endpoint_name}' not found")
    endpoint = evaluation_endpoints[endpoint_name]
    try:
        endpoint.remove_model(model_id)
        del models[model_id]
        return {
            "message": f"Model '{model_id}' removed from endpoint '{endpoint_name}' successfully"
        }
    except ValueError as e:
        raise ValueError(f"Error removing model: {str(e)}") from e


def evaluate_model(
    endpoint_name: str, model_id: str, data: EvaluationInput
) -> Dict[str, Any]:
    """
    Evaluate a model using the specified evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to use.
    model_id : str
        The ID of the model to use.
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
    return endpoint.evaluate(model_id, data)


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
