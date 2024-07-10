"""Configuration API for evaluation endpoints."""

from typing import Dict, List

from backend.api.models.evaluate import (
    EndpointConfig,
    EvaluationEndpoint,
    EvaluationInput,
    EvaluationResult,
)


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
