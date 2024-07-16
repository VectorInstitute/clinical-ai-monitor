"""Evaluation API functions."""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, TypedDict, Union, cast

import numpy as np
import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from datasets.arrow_dataset import Dataset
from pydantic import BaseModel, Field, validator

from backend.api.models.config import (
    ConditionType,
    EndpointConfig,
    ModelConfig,
    SubgroupCondition,
)


# Define the path for storing endpoint and model data
DATA_DIR = Path("evaluation_data")
DATA_DIR.mkdir(exist_ok=True)


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
    """

    preds_prob: List[float] = Field(..., description="The predicted probabilities")
    target: List[float] = Field(..., description="The target values")
    metadata: Dict[str, List[Any]] = Field(
        ..., description="Additional metadata for the evaluation"
    )


def deep_convert_numpy(
    obj: Any,
) -> Union[int, float, List[Any], Dict[str, Any], str, Any]:
    """
    Recursively convert numpy types to Python native types.

    Parameters
    ----------
    obj : Any
        The object to convert.

    Returns
    -------
    Union[int, float, List[Any], Dict[str, Any], str, Any]
        The converted object.
    """
    conversion_map: Dict[type, Callable[[Any], Any]] = {
        np.integer: int,
        np.floating: float,
        np.ndarray: lambda x: x.tolist(),
        dict: lambda x: {key: deep_convert_numpy(value) for key, value in x.items()},
        list: lambda x: [deep_convert_numpy(item) for item in x],
        datetime: lambda x: x.isoformat(),
    }

    for type_, converter in conversion_map.items():
        if isinstance(obj, type_):
            return converter(obj)
    return obj


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
        return cast(Dict[str, Any], deep_convert_numpy(v))


class EndpointLog(BaseModel):
    """
    Log entry for an endpoint.

    Attributes
    ----------
    timestamp : datetime
        Timestamp of the log entry.
    action : str
        Action performed.
    details : Optional[Dict[str, Any]]
        Additional details of the action.
    """

    timestamp: datetime
    action: str
    details: Optional[Dict[str, Any]] = None


class EndpointData(BaseModel):
    """
    Data for an endpoint, including configuration, logs, and associated models.

    Attributes
    ----------
    config : EndpointConfig
        Configuration of the endpoint.
    logs : List[EndpointLog]
        List of log entries.
    associated_models : List[str]
        List of associated model IDs.
    """

    config: EndpointConfig
    logs: List[EndpointLog] = []
    associated_models: List[str] = Field(default_factory=list)


class ModelData(BaseModel):
    """
    Data for a model, including configuration and evaluation history.

    Attributes
    ----------
    config : ModelConfig
        Configuration of the model.
    evaluation_history : Dict[str, List[EvaluationResult]]
        Dictionary of evaluation results, keyed by endpoint_id.
    """

    config: ModelConfig
    evaluation_history: Dict[str, List[EvaluationResult]] = Field(default_factory=dict)


class EvaluationEndpoint:
    """Evaluation endpoint class."""

    def __init__(self, endpoint_id: str, config: EndpointConfig) -> None:
        """
        Initialize the EvaluationEndpoint.

        Parameters
        ----------
        endpoint_id : str
            The unique identifier for the endpoint.
        config : EndpointConfig
            The configuration for the evaluation endpoint.
        """
        self.endpoint_id = endpoint_id
        self.config = config
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
        if condition.type == ConditionType.RANGE:
            if condition.min_value is None and condition.max_value is None:
                raise ValueError("Range condition must have a min_value or max_value")
            if condition.min_value is not None:
                condition_dict["min_value"] = condition.min_value
            if condition.max_value is not None:
                condition_dict["max_value"] = condition.max_value
        elif condition.type in (
            ConditionType.VALUE,
            ConditionType.CONTAINS,
            ConditionType.YEAR,
            ConditionType.MONTH,
            ConditionType.DAY,
        ):
            if condition.value is None:
                raise ValueError(
                    f"{condition.type.value.capitalize()} condition must have a value"
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
        model_id : str
            The ID of the model to evaluate.
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

        evaluation_result = EvaluationResult(
            metrics=[f"{metric.type}_{metric.name}" for metric in self.config.metrics],
            subgroups=slices,
            evaluation_result=result,
            timestamp=datetime.now(),
            sample_size=sample_size,
        )

        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="evaluated",
                details={"model_id": model_id},
            )
        )
        self._save_data()

        return evaluation_result.dict()

    def _load_data(self) -> Optional[EndpointData]:
        """Load endpoint data from JSON file."""
        file_path = DATA_DIR / f"endpoint_{self.endpoint_id}.json"
        if file_path.exists():
            with open(file_path, "r") as f:
                data = json.load(f)
            return EndpointData(**data)
        return None

    def _save_data(self) -> None:
        """Save endpoint data to JSON file."""
        file_path = DATA_DIR / f"endpoint_{self.endpoint_id}.json"
        serializable_data = self.data.dict()
        with open(file_path, "w") as f:
            json.dump(deep_convert_numpy(serializable_data), f)

    def associate_model(self, model_id: str) -> None:
        """Associate a model with this endpoint.

        Parameters
        ----------
        model_id : str
            The ID of the model to associate

        Raises
        ------
        ValueError
            If the model is already associated with this endpoint
        """
        if "associated_models" not in self.data.dict():
            self.data.associated_models = []
        if model_id not in self.data.associated_models:
            self.data.associated_models.append(model_id)
            self._save_data()

    def disassociate_model(self, model_id: str) -> None:
        """Disassociate a model from this endpoint.

        Parameters
        ----------
        model_id : str
            The ID of the model to disassociate

        Raises
        ------
        ValueError
            If the model is not associated with this endpoint
        """
        if (
            "associated_models" in self.data.dict()
            and model_id in self.data.associated_models
        ):
            self.data.associated_models.remove(model_id)
            self._save_data()

    @classmethod
    def load(cls, endpoint_id: str) -> "EvaluationEndpoint":
        """
        Load endpoint data from JSON file.

        Parameters
        ----------
        endpoint_id : str
            The ID of the endpoint to load.

        Returns
        -------
        EvaluationEndpoint
            The loaded evaluation endpoint.

        Raises
        ------
        ValueError
            If the endpoint file is not found.
        """
        file_path = DATA_DIR / f"endpoint_{endpoint_id}.json"
        if not file_path.exists():
            raise ValueError(f"Endpoint with ID '{endpoint_id}' not found")
        with open(file_path, "r") as f:
            data = json.load(f)
        config = EndpointConfig(**data["config"])
        endpoint = cls(endpoint_id, config)
        endpoint.data = EndpointData(**data)
        return endpoint


def load_model_data(model_id: str) -> Optional[ModelData]:
    """Load model data from JSON file.

    Parameters
    ----------
    model_id : str
        The ID of the model to load

    Returns
    -------
    Optional[ModelData]
        The loaded model data, or None if the file does not exist

    Raises
    ------
    ValueError
        If the model file is not found
    """
    file_path = DATA_DIR / f"model_{model_id}.json"
    if file_path.exists():
        with open(file_path, "r") as f:
            data = json.load(f)
        return ModelData(**data)
    return None


def save_model_data(model_id: str, model_data: ModelData) -> None:
    """Save model data to JSON file.

    Parameters
    ----------
    model_id : str
        The ID of the model to save
    model_data : ModelData
        The model data to save

    Raises
    ------
    ValueError
        If the model file already exists
    """
    file_path = DATA_DIR / f"model_{model_id}.json"
    serializable_data = model_data.dict()
    with open(file_path, "w") as f:
        json.dump(deep_convert_numpy(serializable_data), f)


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
        endpoint_id = file_path.stem.split("_", 1)[1]
        try:
            endpoint = EvaluationEndpoint.load(endpoint_id)
            endpoints[endpoint_id] = endpoint
        except Exception as e:
            print(f"Error loading endpoint {endpoint_id}: {str(e)}")
    return endpoints


evaluation_endpoints: Dict[str, EvaluationEndpoint] = load_all_endpoints()


def create_evaluation_endpoint(
    endpoint_id: str, config: EndpointConfig
) -> Dict[str, str]:
    """
    Create a new evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_id : str
        The ID for the new evaluation endpoint.
    config : EndpointConfig
        The configuration for the new evaluation endpoint.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message or an error message.
    """
    try:
        if endpoint_id in evaluation_endpoints:
            raise ValueError(f"Endpoint with ID '{endpoint_id}' already exists")
        endpoint = EvaluationEndpoint(endpoint_id, config)
        evaluation_endpoints[endpoint_id] = endpoint
        return {
            "message": f"Evaluation endpoint with ID '{endpoint_id}' created successfully"
        }
    except Exception as e:
        return {"error": str(e)}


def delete_evaluation_endpoint(endpoint_id: str) -> Dict[str, str]:
    """
    Delete an evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to delete.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the endpoint with the given ID doesn't exist.
    """
    if endpoint_id not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint with ID '{endpoint_id}' not found")
    del evaluation_endpoints[endpoint_id]
    file_path = DATA_DIR / f"endpoint_{endpoint_id}.json"
    if file_path.exists():
        file_path.unlink()
    return {
        "message": f"Evaluation endpoint with ID '{endpoint_id}' deleted successfully"
    }


class EndpointDetails(TypedDict):
    """Details for an evaluation endpoint."""

    endpoint_id: str
    metrics: List[str]
    subgroups: List[str]


def list_evaluation_endpoints() -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of endpoint details.
    """
    return {
        "endpoints": [
            {
                "endpoint_id": endpoint_id,
                "metrics": [
                    f"{metric.type}_{metric.name}" for metric in endpoint.config.metrics
                ],
                "subgroups": [
                    subgroup.column for subgroup in endpoint.config.subgroups
                ],
            }
            for endpoint_id, endpoint in evaluation_endpoints.items()
        ]
    }


def list_models() -> Dict[str, List[Dict[str, Any]]]:
    """
    List all models across all endpoints.

    Returns
    -------
    Dict[str, List[Dict[str, Any]]]
        A dictionary containing a list of all models.
    """
    models = []
    for file_path in DATA_DIR.glob("model_*.json"):
        with open(file_path, "r") as f:
            model_data = json.load(f)
        model_id = file_path.stem.split("_", 1)[1]
        models.append(
            {
                "model_id": model_id,
                "model_name": model_data["config"]["model_name"],
                "model_description": model_data["config"]["model_description"],
                "associated_endpoints": [
                    endpoint_id
                    for endpoint_id, endpoint in evaluation_endpoints.items()
                    if model_id in endpoint.data.associated_models
                ],
            }
        )
    return {"models": models}


def associate_model_to_endpoint(
    endpoint_id: str, model_id: str, model_config: ModelConfig
) -> Dict[str, str]:
    """
    Associate a model with an existing endpoint.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to associate the model with.
    model_id : str
        The ID of the model to associate.
    model_config : ModelConfig
        The configuration for the model.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message or an error message.
    """
    try:
        if endpoint_id not in evaluation_endpoints:
            raise ValueError(f"Endpoint with ID '{endpoint_id}' not found")

        endpoint = evaluation_endpoints[endpoint_id]

        # Create or update model data
        model_data = load_model_data(model_id) or ModelData(config=model_config)
        save_model_data(model_id, model_data)

        # Associate model with endpoint
        endpoint.associate_model(model_id)

        endpoint.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="associated_model",
                details={"model_id": model_id},
            )
        )
        endpoint._save_data()

        return {
            "message": f"Model '{model_id}' associated with endpoint '{endpoint_id}' successfully"
        }
    except Exception as e:
        return {"error": str(e)}


def evaluate_model(model_id: str, data: EvaluationInput) -> Dict[str, Any]:
    """
    Evaluate a model using the associated endpoint's configuration.

    Parameters
    ----------
    model_id : str
        The ID of the model to evaluate.
    data : EvaluationInput
        The input data for evaluation.

    Returns
    -------
    Dict[str, Any]
        The serialized evaluation results.

    Raises
    ------
    ValueError
        If the specified model ID does not exist or is not associated with any endpoint.
    """
    model_data = load_model_data(model_id)
    if not model_data:
        raise ValueError(f"Model with ID '{model_id}' not found")

    for endpoint_id, endpoint in evaluation_endpoints.items():
        if model_id in endpoint.data.associated_models:
            result_dict = endpoint.evaluate(model_id, data)

            # Create an EvaluationResult object
            result = EvaluationResult(
                metrics=result_dict["metrics"],
                subgroups=result_dict["subgroups"],
                evaluation_result=result_dict["evaluation_result"],
                timestamp=result_dict["timestamp"],
                sample_size=result_dict["sample_size"],
            )

            if endpoint_id not in model_data.evaluation_history:
                model_data.evaluation_history[endpoint_id] = []

            model_data.evaluation_history[endpoint_id].append(result)
            save_model_data(model_id, model_data)
            return result_dict

    raise ValueError(f"Model with ID '{model_id}' is not associated with any endpoint")


def get_endpoint_logs(endpoint_id: str) -> List[EndpointLog]:
    """
    Get logs for a specific endpoint.

    Parameters
    ----------
    endpoint_id : str
        The ID of the endpoint to retrieve logs for.

    Returns
    -------
    List[EndpointLog]
        A list of logs for the specified endpoint.

    Raises
    ------
    ValueError
        If the specified endpoint ID does not exist.
    """
    if endpoint_id not in evaluation_endpoints:
        raise ValueError(f"Endpoint with ID '{endpoint_id}' not found")

    endpoint = evaluation_endpoints[endpoint_id]
    return endpoint.data.logs
