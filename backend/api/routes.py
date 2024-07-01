"""Routes."""

import logging

from fastapi import APIRouter

from backend.api.models.performance import (
    get_performance_metrics,
)


router = APIRouter()
LOGGER = logging.getLogger("uvicorn.error")


router.add_api_route("/performance_metrics", get_performance_metrics, methods=["GET"])
