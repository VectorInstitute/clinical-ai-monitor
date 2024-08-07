"""Tests the full set of APIs with sample data."""

from typing import Dict, List, Tuple

import requests


BASE_URL = "http://localhost:8001"  # Adjust this to your API's base URL


def create_endpoint(config: Dict) -> Dict:
    """Create an evaluation endpoint."""
    response = requests.post(f"{BASE_URL}/endpoints", json=config)
    return response.json()


def add_model_to_endpoint(endpoint_name: str, model_info: Dict) -> Dict:
    """Add a model to an endpoint."""
    response = requests.post(
        f"{BASE_URL}/endpoints/{endpoint_name}/models", json=model_info
    )
    return response.json()


def create_test_endpoints() -> List[Tuple[str, Dict]]:
    """Create 5 different evaluation endpoints with binary classification metrics."""
    endpoints = []

    # Endpoint 1: Basic Binary Classification
    config1 = {
        "metrics": [
            {"type": "binary", "name": "accuracy"},
            {"type": "binary", "name": "f1_score"},
        ],
        "subgroups": [
            {
                "column": "age",
                "condition": {"type": "range", "min_value": 0, "max_value": 50},
            }
        ],
    }
    result1 = create_endpoint(config1)
    endpoints.append((result1["endpoint_name"], config1))

    # Endpoint 2: Binary Classification with Precision and Recall
    config2 = {
        "metrics": [
            {"type": "binary", "name": "precision"},
            {"type": "binary", "name": "recall"},
        ],
        "subgroups": [
            {"column": "gender", "condition": {"type": "value", "value": "female"}}
        ],
    }
    result2 = create_endpoint(config2)
    endpoints.append((result2["endpoint_name"], config2))

    # Endpoint 3: Binary Classification with ROC
    config3 = {
        "metrics": [
            {"type": "binary", "name": "auroc"},
            {"type": "binary", "name": "tpr"},
        ],
        "subgroups": [
            {
                "column": "smoking_history",
                "condition": {"type": "value", "value": "yes"},
            }
        ],
    }
    result3 = create_endpoint(config3)
    endpoints.append((result3["endpoint_name"], config3))

    # Endpoint 4: Binary Classification with Confusion Matrix
    config4 = {
        "metrics": [
            {"type": "binary", "name": "confusion_matrix"},
            {"type": "binary", "name": "npv"},
        ],
        "subgroups": [
            {"column": "bmi", "condition": {"type": "range", "min_value": 30}}
        ],
    }
    result4 = create_endpoint(config4)
    endpoints.append((result4["endpoint_name"], config4))

    # Endpoint 5: Binary Classification with Advanced Metrics
    config5 = {
        "metrics": [
            {"type": "binary", "name": "mcc"},
            {"type": "binary", "name": "specificity"},
        ],
        "subgroups": [
            {
                "column": "blood_pressure",
                "condition": {"type": "range", "min_value": 140},
            }
        ],
    }
    result5 = create_endpoint(config5)
    endpoints.append((result5["endpoint_name"], config5))

    return endpoints


def add_models_to_endpoints(endpoints: List[Tuple[str, Dict]]) -> None:
    """Add models to the created endpoints."""
    models = [
        {"name": "Sepsis Prediction Model", "version": "1.0"},
        {"name": "Delirium Prediction Model", "version": "2.1"},
        {"name": "Pneumothorax Detection Model", "version": "1.5"},
        {"name": "Heart Failure Prediction Model", "version": "3.2"},
        {"name": "Stroke Risk Assessment Model", "version": "2.0"},
        {"name": "Acute Kidney Injury Prediction Model", "version": "1.1"},
        {"name": "Sepsis Prediction Model", "version": "2.0"},
    ]

    # Add models to endpoints
    add_model_to_endpoint(
        endpoints[0][0], models[0]
    )  # Sepsis Prediction Model 1.0 to endpoint 1
    add_model_to_endpoint(
        endpoints[1][0], models[1]
    )  # Delirium Prediction Model 2.1 to endpoint 2
    add_model_to_endpoint(
        endpoints[2][0], models[2]
    )  # Pneumothorax Detection Model 1.5 to endpoint 3
    add_model_to_endpoint(
        endpoints[3][0], models[4]
    )  # Stroke Risk Assessment Model 2.0 to endpoint 4
    add_model_to_endpoint(
        endpoints[4][0], models[5]
    )  # Acute Kidney Injury Prediction Model 1.1 to endpoint 5
    add_model_to_endpoint(
        endpoints[0][0], models[6]
    )  # Sepsis Prediction Model 2.0 to endpoint 1 (2 versions of same model)

    # Add two different models to the same endpoint (endpoint 2)
    add_model_to_endpoint(
        endpoints[1][0], models[3]
    )  # Heart Failure Prediction Model 3.2 to endpoint 2


if __name__ == "__main__":
    print("Creating endpoints...")
    endpoints = create_test_endpoints()
    print("Endpoints created successfully.")

    print("Adding models to endpoints...")
    add_models_to_endpoints(endpoints)
    print("Models added successfully.")

    print("Test script completed.")
