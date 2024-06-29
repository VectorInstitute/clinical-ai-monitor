import random
from typing import List

from fastapi import Depends, FastAPI
from pydantic import BaseModel

from backend.api.login import User, get_current_user


app = FastAPI()
models = [
    {"id": 1, "name": "Model A"},
    {"id": 2, "name": "Model B"},
    {"id": 3, "name": "Model C"},
]


class Model(BaseModel):
    id: int
    name: str


class ModelHealth(BaseModel):
    health: float
    timestamp: str


class ModelFacts(BaseModel):
    name: str
    summary: str
    approval_date: str
    uses_and_directions: str
    license: str
    contact_information: str


@app.get("/models", response_model=List[Model])
def get_models(user: User = Depends(get_current_user)):
    return models


@app.get("/model/{model_id}/health")
def get_model_health(model_id: int, user: User = Depends(get_current_user)):
    # Mock data generation for model health
    health = random.uniform(70, 100)
    return {"health": health, "timestamp": "2023-06-28T12:00:00Z"}


@app.get("/model/{model_id}/facts", response_model=ModelFacts)
def get_model_facts(model_id: int, user: User = Depends(get_current_user)):
    # Mock data for model facts
    return {
        "name": f"Model {model_id}",
        "summary": "This is an example AI model for clinical use.",
        "approval_date": "2023-01-01",
        "uses_and_directions": "This model is used for...",
        "license": "MIT License",
        "contact_information": "support@example.com",
    }
