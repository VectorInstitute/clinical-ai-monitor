"""Evaluation API functions."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from cyclops.data.slicer import SliceSpec
from cyclops.evaluate import evaluator
from cyclops.evaluate.metrics import create_metric
from cyclops.evaluate.metrics.experimental import MetricDict
from datasets.arrow_dataset import Dataset
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.models.config import EndpointConfig, SubgroupCondition
from api.models.crud import (
    delete_endpoint_data,
    list_all_endpoints,
    list_all_models,
    load_endpoint_data,
    load_model_data,
    save_endpoint_data,
    save_model_data,
)
from api.models.data import (
    EndpointData,
    EndpointDetails,
    EndpointLog,
    EvaluationInput,
    EvaluationResult,
    ModelBasicInfo,
    ModelData,
)
from api.models.db import EndpointDataDB, ModelDataDB


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
        self.data = EndpointData(config=config)

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

    async def evaluate(
        self, model_id: str, data: EvaluationInput, session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Evaluate the model using the provided input data.

        Parameters
        ----------
        model_id : str
            The ID of the model associated to evaluate.
        data : EvaluationInput
            The input data for evaluation.
        session : AsyncSession
            The database session.

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

        slices = list(result["model_for_preds_prob"].keys())
        sample_size = len(data.preds_prob)
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

        await save_endpoint_data(session, self.name, self.data)
        return evaluation_result.dict()

    async def add_model(self, model_info: ModelBasicInfo, session: AsyncSession) -> str:
        """
        Add a model to the endpoint.

        Parameters
        ----------
        model_info : ModelBasicInfo
            Basic information about the model to add.
        session : AsyncSession
            The database session.

        Returns
        -------
        str
            The unique ID of the newly added model.
        """
        model_id = str(uuid.uuid4())
        model_data = ModelData(
            id=model_id,
            endpoints=[self.name],
            basic_info=model_info,
        )
        await save_model_data(session, model_data)

        # Update the endpoint data
        self.data.models.append(model_id)
        self.data.logs.append(
            EndpointLog(
                timestamp=datetime.now(),
                action="added_model",
                details={"model_name": model_info.name, "model_id": model_id},
                endpoint_name=self.name,
            )
        )
        await save_endpoint_data(session, self.name, self.data)

        return model_id

    async def remove_model(self, model_id: str, session: AsyncSession) -> None:
        """
        Remove a model from the endpoint.

        Parameters
        ----------
        model_id : str
            The ID of the model to remove.
        session : AsyncSession
            The database session.

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
        await save_endpoint_data(session, self.name, self.data)

    @classmethod
    async def load(
        cls, endpoint_name: str, session: AsyncSession
    ) -> "EvaluationEndpoint":
        """
        Load endpoint data from the database.

        Parameters
        ----------
        endpoint_name : str
            The name of the endpoint to load.
        session : AsyncSession
            The database session.

        Returns
        -------
        EvaluationEndpoint
            The loaded evaluation endpoint.

        Raises
        ------
        ValueError
            If the endpoint is not found.
        """
        data = await load_endpoint_data(session, endpoint_name)
        if not data:
            raise ValueError(f"Endpoint '{endpoint_name}' not found")
        endpoint = cls(data.config, endpoint_name)
        endpoint.data = data
        return endpoint


async def create_evaluation_endpoint(
    config: EndpointConfig, session: AsyncSession
) -> Dict[str, str]:
    """
    Create a new evaluation endpoint configuration.

    Parameters
    ----------
    config : EndpointConfig
        The configuration for the new evaluation endpoint.
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message or an error message.
    """
    try:
        endpoint_name = f"endpoint_{uuid.uuid4().hex[:8]}"
        endpoint = EvaluationEndpoint(config, endpoint_name)
        await save_endpoint_data(session, endpoint_name, endpoint.data)
        return {
            "message": f"Evaluation endpoint '{endpoint_name}' created successfully",
            "endpoint_name": endpoint_name,
        }
    except Exception as e:
        return {"error": str(e)}


async def delete_evaluation_endpoint(
    endpoint_name: str, session: AsyncSession
) -> Dict[str, str]:
    """
    Delete an evaluation endpoint configuration.

    Parameters
    ----------
    endpoint_name : str
        The name of the evaluation endpoint to delete.
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the endpoint with the given name doesn't exist.
    """
    try:
        await delete_endpoint_data(session, endpoint_name)
        return {
            "message": f"Evaluation endpoint '{endpoint_name}' deleted successfully"
        }
    except ValueError as e:
        raise ValueError(f"Error deleting endpoint: {str(e)}") from e


async def list_evaluation_endpoints(
    session: AsyncSession,
) -> Dict[str, List[EndpointDetails]]:
    """
    List all created evaluation endpoints.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, List[EndpointDetails]]
        A dictionary containing a list of endpoint details.
    """
    endpoints = await list_all_endpoints(session)
    endpoint_details = []
    for endpoint_name in endpoints:
        endpoint_data = await load_endpoint_data(session, endpoint_name)
        if endpoint_data:
            endpoint_details.append(
                EndpointDetails(
                    name=endpoint_name,
                    metrics=[
                        f"{metric.type}_{metric.name}"
                        for metric in endpoint_data.config.metrics
                    ],
                    models=endpoint_data.models,
                )
            )
    return {"endpoints": endpoint_details}


async def list_models(session: AsyncSession) -> Dict[str, ModelData]:
    """
    List all models.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, ModelData]
        A dict with all models, with model IDs as keys and ModelData as values.
    """
    return await list_all_models(session)


async def get_model_by_id(model_id: str, session: AsyncSession) -> Optional[ModelData]:
    """
    Get a model by its ID.

    Parameters
    ----------
    model_id : str
        The ID of the model to retrieve.
    session : AsyncSession
        The database session.

    Returns
    -------
    Optional[ModelData]
        The model data if found, None otherwise.
    """
    return await load_model_data(session, model_id)


async def add_model_to_endpoint(
    endpoint_name: str, model_info: ModelBasicInfo, session: AsyncSession
) -> Dict[str, str]:
    """
    Add a model to an existing evaluation endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to add the model to.
    model_info : ModelBasicInfo
        Basic information about the model to be added.
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message and the new model ID.

    Raises
    ------
    ValueError
        If the endpoint doesn't exist.
    """
    endpoint = await EvaluationEndpoint.load(endpoint_name, session)
    model_id = await endpoint.add_model(model_info, session)
    return {
        "message": f"Model '{model_info.name}' added to endpoint '{endpoint_name}' successfully",
        "model_id": model_id,
    }


async def remove_model_from_endpoint(
    endpoint_name: str, model_id: str, session: AsyncSession
) -> Dict[str, str]:
    """
    Remove a model from an existing evaluation endpoint.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint to remove the model from.
    model_id : str
        The ID of the model to be removed.
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    ValueError
        If the endpoint or model doesn't exist.
    """
    endpoint = await EvaluationEndpoint.load(endpoint_name, session)
    try:
        await endpoint.remove_model(model_id, session)
        return {
            "message": f"Model '{model_id}' removed from endpoint '{endpoint_name}' successfully"
        }
    except ValueError as e:
        raise ValueError(f"Error removing model: {str(e)}") from e


async def evaluate_model(
    endpoint_name: str, model_id: str, data: EvaluationInput, session: AsyncSession
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
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, Any]
        The serialized evaluation results.

    Raises
    ------
    ValueError
        If the specified endpoint does not exist.
    """
    endpoint = await EvaluationEndpoint.load(endpoint_name, session)
    return await endpoint.evaluate(model_id, data, session)


async def get_endpoint_logs(session: AsyncSession) -> List[EndpointLog]:
    """
    Get logs for all endpoints.

    Parameters
    ----------
    session : AsyncSession
        The database session.

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
    endpoints = await load_all_endpoints(session)
    for endpoint_name, endpoint in endpoints.items():
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


# Additional utility functions that might be needed


async def load_all_endpoints(session: AsyncSession) -> Dict[str, EvaluationEndpoint]:
    """
    Load all endpoints from the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, EvaluationEndpoint]
        A dictionary of all loaded endpoints.
    """
    endpoints: Dict[str, EvaluationEndpoint] = {}
    result = await session.execute(select(EndpointDataDB))
    for db_endpoint in result.scalars():
        try:
            endpoint = await EvaluationEndpoint.load(db_endpoint.name, session)
            endpoints[db_endpoint.name] = endpoint
        except Exception as e:
            print(f"Error loading endpoint {db_endpoint.name}: {str(e)}")
    return endpoints


async def load_all_models(session: AsyncSession) -> Dict[str, ModelData]:
    """
    Load all models from the database.

    Parameters
    ----------
    session : AsyncSession
        The database session.

    Returns
    -------
    Dict[str, ModelData]
        A dictionary with loaded model data.
    """
    models = {}
    result = await session.execute(select(ModelDataDB))
    for db_model in result.scalars():
        try:
            model_data = await load_model_data(session, db_model.id)
            if model_data:
                models[db_model.id] = model_data
        except Exception as e:
            print(f"Error loading model {db_model.id}: {str(e)}")
    return models
