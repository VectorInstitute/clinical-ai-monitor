import random
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


class Metric(BaseModel):
    name: str
    type: str
    slice: str
    tooltip: str
    value: float
    threshold: float
    passed: bool
    history: List[float]
    timestamps: List[str]


class MetricCards(BaseModel):
    metrics: List[str]
    tooltips: List[str]
    slices: List[str]
    values: List[str]
    collection: List[Metric]


class Overview(BaseModel):
    last_n_evals: int
    mean_std_min_evals: int
    metric_cards: MetricCards


class PerformanceData(BaseModel):
    overview: Overview


@app.get("/api/performance_metrics", response_model=PerformanceData)
async def get_performance_metrics():
    metrics = ["Accuracy", "Precision", "Recall", "F1 Score"]
    tooltips = [
        "The proportion of all instances that are correctly predicted.",
        "The proportion of predicted positive instances that are correctly predicted.",
        "The proportion of actual positive instances that are correctly predicted.",
        "The harmonic mean of precision and recall.",
    ]
    slices = ["Age:[30 - 50)", "Age:[50 - 70)", "overall"]

    collection = []
    for metric in metrics:
        for slice in slices:
            history = [round(random.uniform(0.5, 1.0), 2) for _ in range(30)]
            value = history[-1]
            threshold = 0.6
            collection.append(
                Metric(
                    name=metric,
                    type=f"Binary{metric.replace(' ', '')}",
                    slice=slice,
                    tooltip=tooltips[metrics.index(metric)],
                    value=value,
                    threshold=threshold,
                    passed=value >= threshold,
                    history=history,
                    timestamps=[
                        (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
                        for i in range(29, -1, -1)
                    ],
                )
            )

    return PerformanceData(
        overview=Overview(
            last_n_evals=3,
            mean_std_min_evals=3,
            metric_cards=MetricCards(
                metrics=metrics,
                tooltips=tooltips,
                slices=slices,
                values=["[30 - 50)", "[50 - 70)"],
                collection=collection,
            ),
        )
    )
