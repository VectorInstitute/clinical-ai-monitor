"""Backend server for the app."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from api.users.crud import create_initial_admin
from api.users.db import get_async_session, init_db


app = FastAPI()
frontend_port = os.getenv("FRONTEND_PORT", None)
if not frontend_port:
    raise ValueError("No FRONTEND_PORT environment variable set!")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{frontend_port}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    """
    Initialize the database and create the initial admin user on startup.

    This function is called when the FastAPI application starts up. It initializes
    the database and creates an initial admin user if one doesn't already exist.
    """
    await init_db()
    async for session in get_async_session():
        await create_initial_admin(session)


@app.get("/")
async def root() -> dict:
    """
    Root endpoint of the API.

    Returns
    -------
    dict
        A welcome message for the Clinical AI Monitor API.
    """
    return {"message": "Welcome to the Clinical AI Monitor API"}


@app.get("/healthcheck")
async def healthcheck() -> dict:
    """
    Health check endpoint.

    This endpoint can be used to verify that the API is running and responsive.

    Returns
    -------
    dict
        A dictionary indicating the health status of the API.
    """
    return {"status": "healthy"}
