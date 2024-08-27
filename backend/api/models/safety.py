"""Model safety API."""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Union

from fastapi import HTTPException

from api.models.data import (
    EvaluationCriterion,
    EvaluationFrequency,
    Metric,
    ModelData,
    ModelSafety,
)
from api.models.db import load_model_data
from api.models.performance import get_performance_metrics


def check_criterion(
    criterion: EvaluationCriterion, metric_value: Union[int, float]
) -> bool:
    """
    Check if a criterion is met based on the metric value.

    Parameters
    ----------
    criterion : EvaluationCriterion
        The criterion to check.
    metric_value : Union[int, float]
        The current value of the metric.

    Returns
    -------
    bool
        True if the criterion is met, False otherwise.
    """
    threshold = float(criterion.threshold)
    value = float(metric_value)

    if criterion.operator == ">":
        return value > threshold
    if criterion.operator == "<":
        return value < threshold
    if criterion.operator == "=":
        return value == threshold
    if criterion.operator == ">=":
        return value >= threshold
    if criterion.operator == "<=":
        return value <= threshold
    raise ValueError(f"Unknown operator: {criterion.operator}")


async def get_model_safety(model_id: str) -> ModelSafety:  # noqa: PLR0912
    """
    Retrieve the safety data for a specific model.

    Parameters
    ----------
    model_id : str
        The unique identifier of the model.

    Returns
    -------
    ModelSafety
        An object containing the overall safety status, last evaluated date,
        and individual metrics.

    Raises
    ------
    HTTPException
        If the model_id is not found or if there's an error retrieving
        the data.
    """
    try:
        model_data: ModelData = load_model_data(model_id)
        if model_data is None:
            raise HTTPException(status_code=404, detail="Model not found")

        if not model_data.endpoints:
            raise ValueError("No endpoints found for this model")

        endpoint_name = model_data.endpoints[0]
        performance_metrics: Dict[str, Any] = await get_performance_metrics(
            endpoint_name, model_id
        )
        if (
            "overview" not in performance_metrics
            or "metric_cards" not in performance_metrics["overview"]
        ):
            raise ValueError("Unexpected performance metrics structure")

        collection = performance_metrics["overview"]["metric_cards"].get(
            "collection", []
        )
        if not collection:
            raise ValueError("No metrics found in performance data")
        current_date: datetime = datetime.now()
        last_evaluated = datetime.fromisoformat(collection[0]["timestamps"][-1])

        metrics: List[Metric] = []
        for criterion in model_data.evaluation_criteria:
            metric_data = next(
                (
                    m
                    for m in performance_metrics["overview"]["metric_cards"][
                        "collection"
                    ]
                    if m["name"].lower() == criterion.metric_name.lower()
                ),
                None,
            )
            if metric_data is None:
                continue

            metric_value = metric_data["value"]
            status = "met" if check_criterion(criterion, metric_value) else "not met"
            metrics.append(
                Metric(
                    name=criterion.metric_name,
                    display_name=criterion.display_name,
                    value=metric_value,
                    threshold=criterion.threshold,
                    status=status,
                    history=metric_data["history"],
                    timestamps=metric_data["timestamps"],
                    sample_sizes=metric_data["sample_sizes"],
                    type=metric_data["type"],
                    slice=metric_data["slice"],
                    tooltip=metric_data["tooltip"],
                    passed=status == "met",
                )
            )

        all_criteria_met = all(metric.status == "met" for metric in metrics)
        evaluation_frequency = model_data.evaluation_frequency or EvaluationFrequency(
            value=30, unit="days"
        )

        if evaluation_frequency.unit == "hours":
            threshold = timedelta(hours=evaluation_frequency.value)
        elif evaluation_frequency.unit == "days":
            threshold = timedelta(days=evaluation_frequency.value)
        elif evaluation_frequency.unit == "weeks":
            threshold = timedelta(weeks=evaluation_frequency.value)
        elif evaluation_frequency.unit == "months":
            threshold = timedelta(days=evaluation_frequency.value * 30)  # Approximate
        else:
            raise ValueError(f"Unknown frequency unit: {evaluation_frequency.unit}")

        is_recently_evaluated = (current_date - last_evaluated) <= threshold
        overall_status = (
            "No warnings" if all_criteria_met and is_recently_evaluated else "Warning"
        )

        return ModelSafety(
            metrics=metrics,
            last_evaluated=last_evaluated.isoformat(),
            overall_status=overall_status,
            is_recently_evaluated=is_recently_evaluated,
        )
    except ValueError as ve:
        logging.error(f"ValueError in get_model_safety: {str(ve)}")
        raise HTTPException(status_code=500, detail=str(ve)) from ve
    except Exception as e:
        logging.error(f"Unexpected error in get_model_safety: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error retrieving model safety: {str(e)}"
        ) from e
