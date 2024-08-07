"""Tests the full set of APIs with sample data."""

import random
from datetime import datetime, timedelta
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


def evaluate_model(endpoint_name: str, model_id: str, data: Dict) -> Dict:
    """Evaluate a model using the specified evaluation endpoint."""
    response = requests.post(
        f"{BASE_URL}/evaluate/{endpoint_name}/{model_id}", json=data
    )
    return response.json()


def create_test_endpoints() -> List[Tuple[str, Dict]]:
    """Create 5 different evaluation endpoints with binary classification metrics."""
    endpoints = [
        {
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
        },
        {
            "metrics": [
                {"type": "binary", "name": "precision"},
                {"type": "binary", "name": "recall"},
            ],
            "subgroups": [
                {"column": "gender", "condition": {"type": "value", "value": "female"}}
            ],
        },
        {
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
        },
        {
            "metrics": [
                {"type": "binary", "name": "ppv"},
                {"type": "binary", "name": "npv"},
            ],
            "subgroups": [
                {"column": "bmi", "condition": {"type": "range", "min_value": 30}}
            ],
        },
        {
            "metrics": [
                {"type": "binary", "name": "sensitivity"},
                {"type": "binary", "name": "specificity"},
            ],
            "subgroups": [
                {
                    "column": "blood_pressure",
                    "condition": {"type": "range", "min_value": 140},
                }
            ],
        },
    ]

    return [(create_endpoint(config)["endpoint_name"], config) for config in endpoints]


def generate_dummy_data(sample_size: int, config: Dict, timestamp: datetime) -> Dict:
    """Generate dummy data for evaluation."""
    preds_prob = [random.random() for _ in range(sample_size)]
    target = [random.choice([0, 1]) for _ in range(sample_size)]

    metadata = {}
    for subgroup in config["subgroups"]:
        column = subgroup["column"]
        condition = subgroup["condition"]

        if condition["type"] == "range":
            min_value = condition.get("min_value", 0)
            max_value = condition.get("max_value", min_value + 100)
            metadata[column] = [
                random.randint(min_value, max_value) for _ in range(sample_size)
            ]
        elif condition["type"] == "value":
            metadata[column] = [
                random.choice([condition["value"], "other"]) for _ in range(sample_size)
            ]

    return {
        "preds_prob": preds_prob,
        "target": target,
        "metadata": metadata,
        "timestamp": timestamp.isoformat(),
    }


def add_models_and_evaluate(endpoints: List[Tuple[str, Dict]]) -> None:
    """Add models to the created endpoints and perform evaluations."""
    models = [
        {"name": "Sepsis Prediction Model", "version": "1.0"},
        {"name": "Delirium Prediction Model", "version": "2.1"},
        {"name": "Pneumothorax Detection Model", "version": "1.5"},
        {"name": "Heart Failure Prediction Model", "version": "3.2"},
        {"name": "Stroke Risk Assessment Model", "version": "2.0"},
    ]

    base_date = datetime.now() - timedelta(days=100)  # Start 100 days ago

    for (endpoint_name, config), model in zip(endpoints, models):
        model_response = add_model_to_endpoint(endpoint_name, model)
        model_id = model_response.get("model_id")

        if model_id:
            print(f"Model {model['name']} added to endpoint {endpoint_name}")

            days_between_evaluations = random.randint(3, 10)

            for j in range(10):  # Perform 10 evaluations for each model
                evaluation_date = base_date + timedelta(
                    days=j * days_between_evaluations
                )
                dummy_data = generate_dummy_data(1000, config, evaluation_date)
                try:
                    evaluate_model(endpoint_name, model_id, dummy_data)
                    print(
                        f"Evaluation performed for model {model_id} on endpoint {endpoint_name} at {evaluation_date}"
                    )
                except Exception as e:
                    print(f"Error during evaluation: {str(e)}")
        else:
            print(f"Failed to add model {model['name']} to endpoint {endpoint_name}")


if __name__ == "__main__":
    print("Creating endpoints...")
    endpoints = create_test_endpoints()
    print("Endpoints created successfully.")

    print("Adding models to endpoints and performing evaluations...")
    add_models_and_evaluate(endpoints)
    print("Models added and evaluations performed successfully.")

    print("Test script completed.")
