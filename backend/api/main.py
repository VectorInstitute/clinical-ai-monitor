"""Backend server for the app."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from api.users.crud import create_initial_admin
from api.users.db import Base, SessionLocal, engine


# Create tables
Base.metadata.create_all(bind=engine)

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

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def startup_event():
    """Create the admin user on startup."""
    db = SessionLocal()
    try:
        create_initial_admin(db)
    finally:
        db.close()


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the API"}
