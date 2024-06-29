"""Routes."""

import logging

from fastapi import APIRouter

from backend.api.models import (
    get_model_facts,
    get_model_health,
    get_models,
)


router = APIRouter()
LOGGER = logging.getLogger("uvicorn.error")


router.add_api_route("/models", get_models, methods=["GET"])
router.add_api_route("/model/{model_id}/health", get_model_health, methods=["GET"])
router.add_api_route("/model/{model_id}/facts", get_model_facts, methods=["GET"])
