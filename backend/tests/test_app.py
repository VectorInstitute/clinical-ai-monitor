"""Tests the full set of APIs with sample data."""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

import requests

from api.models.constants import METRIC_DISPLAY_NAMES
from api.models.data import ModelFacts


BASE_URL = "http://localhost:8001"  # Adjust this to your API's base URL


def api_request(method: str, endpoint: str, data: Dict = None) -> Dict:
    """Make an API request and return the JSON response."""
    url = f"{BASE_URL}{endpoint}"
    response = requests.request(method, url, json=data)
    response.raise_for_status()
    return response.json()


def create_endpoint(config: Dict) -> Dict:
    """Create an evaluation endpoint."""
    return api_request("POST", "/endpoints", config)


def add_model_to_endpoint(endpoint_name: str, model_info: Dict) -> Dict:
    """Add a model to an endpoint."""
    return api_request("POST", f"/endpoints/{endpoint_name}/models", model_info)


def evaluate_model(endpoint_name: str, model_id: str, data: Dict) -> Dict:
    """Evaluate a model using the specified evaluation endpoint."""
    return api_request("POST", f"/evaluate/{endpoint_name}/{model_id}", data)


def add_model_facts(model_id: str, facts: Dict) -> Dict:
    """Add facts to a model."""
    model_facts = ModelFacts(**facts)
    return api_request("POST", f"/models/{model_id}/facts", model_facts.dict())


def add_evaluation_criteria(model_id: str, criteria: List[Dict]) -> Dict:
    """Add evaluation criteria to a model."""
    return api_request("POST", f"/models/{model_id}/evaluation-criteria", criteria)


def set_evaluation_frequency(model_id: str, frequency: Dict) -> Dict:
    """Set evaluation frequency for a model."""
    return api_request("POST", f"/models/{model_id}/evaluation-frequency", frequency)


def create_test_endpoints() -> List[Tuple[str, Dict]]:
    """Create 5 different evaluation endpoints with various metrics."""
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
                {"type": "binary", "name": "accuracy"},
                {"type": "binary", "name": "precision"},
                {"type": "binary", "name": "recall"},
            ],
            "subgroups": [
                {"column": "gender", "condition": {"type": "value", "value": "female"}}
            ],
        },
        {
            "metrics": [
                {"type": "binary", "name": "accuracy"},
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
                {"type": "binary", "name": "accuracy"},
                {"type": "binary", "name": "ppv"},
                {"type": "binary", "name": "npv"},
            ],
            "subgroups": [
                {"column": "bmi", "condition": {"type": "range", "min_value": 30}}
            ],
        },
        {
            "metrics": [
                {"type": "binary", "name": "accuracy"},
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


def generate_model_facts(model_name: str, model_version: str) -> Dict:
    """Generate realistic model facts for clinical scenarios."""
    clinical_scenarios = {
        "Sepsis Prediction Model": {
            "intended_use": "Predict sepsis risk in ICU patients",
            "target_population": "Adult ICU patients (18+ years)",
            "input_data": [
                "Vital signs",
                "Laboratory results",
                "Demographic information",
            ],
            "output_data": "Sepsis risk score (0-1)",
            "summary": "This model predicts the risk of sepsis in ICU patients within the next 6 hours.",
            "mechanism_of_action": "The model uses a recurrent neural network to process time-series data of patient vitals and lab results, identifying patterns indicative of impending sepsis.",
        },
        "Delirium Prediction Model": {
            "intended_use": "Predict delirium risk in hospitalized elderly patients",
            "target_population": "Hospitalized patients aged 65 and older",
            "input_data": [
                "Medication history",
                "Cognitive assessments",
                "Laboratory results",
                "Demographic information",
            ],
            "output_data": "Delirium risk score (0-1)",
            "summary": "This model predicts the risk of delirium onset in elderly hospitalized patients within 24 hours.",
            "mechanism_of_action": "The model employs a gradient boosting algorithm to analyze patient data, focusing on known risk factors for delirium in the elderly population.",
        },
        "Pneumothorax Detection Model": {
            "intended_use": "Detect pneumothorax in chest X-rays",
            "target_population": "Patients undergoing chest X-ray examination",
            "input_data": ["Chest X-ray images"],
            "output_data": "Pneumothorax probability and localization",
            "summary": "This model analyzes chest X-rays to detect and localize pneumothorax, aiding in rapid diagnosis.",
            "mechanism_of_action": "The model uses a convolutional neural network trained on a large dataset of annotated chest X-rays to identify radiographic signs of pneumothorax.",
        },
        "Heart Failure Prediction Model": {
            "intended_use": "Predict risk of heart failure exacerbation",
            "target_population": "Patients with diagnosed heart failure",
            "input_data": [
                "Echocardiogram results",
                "BNP levels",
                "Medication adherence",
                "Vital signs",
                "Demographic information",
            ],
            "output_data": "Heart failure exacerbation risk score (0-1)",
            "summary": "This model predicts the risk of heart failure exacerbation within the next 30 days for patients with diagnosed heart failure.",
            "mechanism_of_action": "The model uses a random forest algorithm to analyze a combination of clinical, laboratory, and patient-reported data to identify patterns associated with impending heart failure exacerbation.",
        },
        "Stroke Risk Assessment Model": {
            "intended_use": "Assess long-term stroke risk in patients with atrial fibrillation",
            "target_population": "Adult patients diagnosed with atrial fibrillation",
            "input_data": [
                "Age",
                "Blood pressure",
                "Clinical history",
                "ECG data",
                "Echocardiography results",
            ],
            "output_data": "5-year stroke risk probability",
            "summary": "This model provides a 5-year stroke risk assessment for patients with atrial fibrillation to guide anticoagulation therapy decisions.",
            "mechanism_of_action": "The model uses a Cox proportional hazards model trained on long-term follow-up data from atrial fibrillation cohorts to estimate stroke risk based on established and novel risk factors.",
        },
    }

    scenario = clinical_scenarios.get(
        model_name, clinical_scenarios["Sepsis Prediction Model"]
    )

    return {
        "name": model_name,
        "version": model_version,
        "type": "Clinical Decision Support AI Model",
        "intended_use": scenario["intended_use"],
        "target_population": scenario["target_population"],
        "input_data": scenario["input_data"],
        "output_data": scenario["output_data"],
        "summary": scenario["summary"],
        "mechanism_of_action": scenario["mechanism_of_action"],
        "validation_and_performance": {
            "internal_validation": f"AUC: {random.uniform(0.75, 0.95):.2f}, Sensitivity: {random.uniform(0.70, 0.90):.2f}, Specificity: {random.uniform(0.75, 0.95):.2f}",
            "external_validation": f"AUC: {random.uniform(0.70, 0.90):.2f} at {random.choice(['City General Hospital', 'University Medical Center', 'Regional Health System'])}",
            "performance_in_subgroups": [
                f"{'Similar' if random.random() > 0.5 else 'Slightly lower'} performance in patients over 75 years old",
                f"{'Comparable' if random.random() > 0.5 else 'Marginally better'} performance in female patients",
                f"Performance {'maintained' if random.random() > 0.5 else 'slightly decreased'} in patients with multiple comorbidities",
            ],
        },
        "uses_and_directions": [
            f"Use for {scenario['target_population']}",
            "Integrate model predictions into clinical workflow for risk stratification",
            f"High risk (>0.7): Consider immediate clinical assessment and intervention as appropriate for {model_name.lower()}",
            "Use in conjunction with clinical judgment and established guidelines",
        ],
        "warnings": [
            f"Do not use as the sole basis for clinical decisions related to {model_name.lower()}",
            "Performance may vary in populations not well-represented in the training data",
            "Model predictions should be interpreted in the context of each patient's unique clinical presentation",
            "Regular revalidation and potential retraining may be necessary to maintain performance over time",
        ],
        "other_information": {
            "approval_date": (
                datetime.now() - timedelta(days=random.randint(30, 365))
            ).strftime("%B %d, %Y"),
            "license": "Proprietary - For use only within approved healthcare institutions",
            "contact_information": "clinicalsupport@aimodelco.com",
            "publication_link": f"https://doi.org/10.1000/clinicalai.{random.randint(1000, 9999)}.{random.randint(100, 999)}",
        },
    }


def generate_evaluation_criteria(endpoint_config: Dict) -> List[Dict]:
    """Generate evaluation criteria based on the endpoint's metrics."""
    criteria = []
    for metric in endpoint_config["metrics"]:
        full_metric_name = f"{metric['type']}_{metric['name']}"
        criteria.append(
            {
                "metric_name": full_metric_name,
                "display_name": METRIC_DISPLAY_NAMES.get(
                    full_metric_name, full_metric_name
                ),
                "operator": ">",
                "threshold": round(random.uniform(0.45, 0.55), 2),
            }
        )
    return criteria


def generate_evaluation_frequency(model_name: str) -> Dict:
    """Generate evaluation frequency for a model."""
    if "Sepsis" in model_name or "Delirium" in model_name:
        return {"value": 7, "unit": "days"}
    if "Pneumothorax" in model_name:
        return {"value": 14, "unit": "days"}
    if "Heart Failure" in model_name:
        return {"value": 30, "unit": "days"}
    if "Stroke" in model_name:
        return {"value": 2, "unit": "months"}
    return {"value": 1, "unit": "months"}


def add_models_and_evaluate(endpoints: List[Tuple[str, Dict]]) -> None:
    """Add models to the created endpoints, add model facts, and perform evaluations."""
    models = [
        {"name": "Sepsis Prediction Model", "version": "2.3"},
        {"name": "Delirium Prediction Model", "version": "1.5"},
        {"name": "Pneumothorax Detection Model", "version": "3.0"},
        {"name": "Heart Failure Prediction Model", "version": "2.1"},
        {"name": "Stroke Risk Assessment Model", "version": "1.8"},
    ]

    model_evaluation_counts = {
        "Sepsis Prediction Model": 25,
        "Delirium Prediction Model": 18,
        "Pneumothorax Detection Model": 22,
        "Heart Failure Prediction Model": 30,
        "Stroke Risk Assessment Model": 20,
    }

    base_date = datetime.now() - timedelta(days=150)  # Start 150 days ago

    for (endpoint_name, config), model in zip(endpoints, models):
        try:
            model_response = add_model_to_endpoint(endpoint_name, model)
            model_id = model_response["model_id"]
            print(f"Model {model['name']} added to endpoint {endpoint_name}")

            add_model_facts(
                model_id, generate_model_facts(model["name"], model["version"])
            )
            print(f"Facts added for model {model['name']}")

            evaluation_criteria = generate_evaluation_criteria(config)
            add_evaluation_criteria(model_id, evaluation_criteria)
            print(f"Evaluation criteria added for model {model['name']}")

            set_evaluation_frequency(
                model_id, generate_evaluation_frequency(model["name"])
            )
            print(f"Evaluation frequency set for model {model['name']}")

            num_evaluations = model_evaluation_counts[model["name"]]
            days_between_evaluations = 150 // num_evaluations

            for j in range(num_evaluations):
                evaluation_date = base_date + timedelta(
                    days=j * days_between_evaluations
                )
                dummy_data = generate_dummy_data(1000, config, evaluation_date)
                evaluate_model(endpoint_name, model_id, dummy_data)
                print(
                    f"Evaluation {j+1}/{num_evaluations} performed for model {model_id} on endpoint {endpoint_name} at {evaluation_date}"
                )

        except requests.exceptions.RequestException as e:
            print(f"Error processing model {model['name']}: {str(e)}")


def main():
    """Run the test script."""
    print("Creating endpoints...")
    endpoints = create_test_endpoints()
    print("Endpoints created successfully.")

    print(
        "Adding models, facts, criteria, setting frequency, and performing evaluations..."
    )
    add_models_and_evaluate(endpoints)

    print("Test script completed successfully.")


if __name__ == "__main__":
    main()
