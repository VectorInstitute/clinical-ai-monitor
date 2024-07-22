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

from api.models.config import (
    ConditionType,
    EndpointConfig,
    SubgroupCondition,
)


# Define the path for storing endpoint data
DATA_DIR = Path("endpoint_data")
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
    Represents a log entry for an endpoint.

    Attributes
    ----------
    timestamp : datetime
        The timestamp of the log entry.
    action : str
        The action performed.
    details : Dict[str, str], optional
        Additional details about the action.
    endpoint_name : str
        The name of the endpoint associated with this log.
    """

    timestamp: datetime
    action: str
    details: Optional[Dict[str, str]] = None
    endpoint_name: str


class EndpointData(BaseModel):
    """
    Data for an endpoint, including configuration, evaluation history, and logs.

    Attributes
    ----------
    config : EndpointConfig
        Configuration of the endpoint.
    evaluation_history : List[EvaluationResult]
        List of evaluation results.
    logs : List[EndpointLog]
        List of log entries.
    """

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

        evaluation_result = EvaluationResult(
            metrics=[f"{metric.type}_{metric.name}" for metric in self.config.metrics],
            subgroups=slices,
            evaluation_result=result,
            timestamp=datetime.now(),
            sample_size=sample_size,
        )
        self.data.evaluation_history.append(evaluation_result)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="evaluated",
                endpoint_name=self.config.endpoint_name,
            )
        )
        self._save_data()
        return evaluation_result.dict()

    def _load_data(self) -> Optional[EndpointData]:
        """Load endpoint data from JSON file."""
        file_path = DATA_DIR / f"{self.config.endpoint_name}.json"
        if file_path.exists():
            with open(file_path, "r") as f:
                data = json.load(f)
            return EndpointData(**data)
        return None

    def _save_data(self) -> None:
        """Save endpoint data to JSON file."""
        file_path = DATA_DIR / f"{self.config.endpoint_name}.json"
        serializable_data = self.data.dict()
        with open(file_path, "w") as f:
            json.dump(deep_convert_numpy(serializable_data), f)

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
        endpoint = cls(config)
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
        if config.endpoint_name in evaluation_endpoints:
            raise ValueError(
                f"Endpoint with name '{config.endpoint_name}' already exists"
            )
        endpoint = EvaluationEndpoint(config)
        evaluation_endpoints[config.endpoint_name] = endpoint
        return {
            "message": f"Evaluation endpoint '{config.endpoint_name}' created successfully"
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
    """
    if endpoint_name not in evaluation_endpoints:
        raise ValueError(f"Evaluation endpoint '{endpoint_name}' not found")
    del evaluation_endpoints[endpoint_name]
    file_path = DATA_DIR / f"{endpoint_name}.json"
    if file_path.exists():
        file_path.unlink()
    return {"message": f"Evaluation endpoint '{endpoint_name}' deleted successfully"}


class EndpointDetails(TypedDict):
    """Details for an evaluation endpoint."""

    endpoint_name: str
    model_name: str
    model_description: str


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


def get_endpoint_logs() -> List[EndpointLog]:
    """
    Get logs for all endpoints.

    Returns
    -------
    List[EndpointLog]
        A list of logs for all endpoints.
    """
    all_logs = []
    for _, endpoint in evaluation_endpoints.items():
        endpoint_logs = [
            EndpointLog(
                timestamp=log.timestamp,
                action=log.action,
                details=log.details,
                endpoint_name=log.endpoint_name,
            )
            for log in endpoint.data.logs
        ]
        all_logs.extend(endpoint_logs)

    # Sort logs by timestamp in descending order (most recent first)
    all_logs.sort(key=lambda x: x.timestamp, reverse=True)

    return all_logs
