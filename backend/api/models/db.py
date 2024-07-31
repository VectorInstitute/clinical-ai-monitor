"""Save and load data."""

import json
from pathlib import Path
from typing import Optional

from api.models.data import (
    EndpointData,
    ModelData,
)


# Define the path for storing endpoint data
DATA_DIR = Path("endpoint_data")
DATA_DIR.mkdir(exist_ok=True)


def save_endpoint_data(endpoint_name: str, data: EndpointData) -> None:
    """
    Save endpoint data to a JSON file.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint.
    data : EndpointData
        The endpoint data to save.
    """
    file_path = DATA_DIR / f"{endpoint_name}.json"
    with open(file_path, "w") as f:
        json.dump(data.dict(), f, indent=2)


def load_endpoint_data(endpoint_name: str) -> Optional[EndpointData]:
    """
    Load endpoint data from a JSON file.

    Parameters
    ----------
    endpoint_name : str
        The name of the endpoint.

    Returns
    -------
    Optional[EndpointData]
        The loaded endpoint data, or None if the file doesn't exist.
    """
    file_path = DATA_DIR / f"{endpoint_name}.json"
    if file_path.exists():
        with open(file_path, "r") as f:
            data = json.load(f)
        return EndpointData(**data)
    return None


def save_model_data(model_id: str, data: ModelData) -> None:
    """
    Save model data to a JSON file.

    Parameters
    ----------
    model_id : str
        The ID of the model.
    data : ModelData
        The model data to save.
    """
    file_path = DATA_DIR / f"model_{model_id}.json"
    with open(file_path, "w") as f:
        json.dump(data.dict(), f, indent=2)


def load_model_data(model_id: str) -> Optional[ModelData]:
    """
    Load model data from a JSON file.

    Parameters
    ----------
    model_id : str
        The ID of the model.

    Returns
    -------
    Optional[ModelData]
        The loaded model data, or None if the file doesn't exist.
    """
    file_path = DATA_DIR / f"model_{model_id}.json"
    if file_path.exists():
        with open(file_path, "r") as f:
            data = json.load(f)
        return ModelData(**data)
    return None
