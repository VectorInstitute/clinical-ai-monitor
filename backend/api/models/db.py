"""Database models and session management for the evaluation API."""

import logging

from sqlalchemy import JSON, Column, String
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.orm import declarative_base

from api.db_config import models_engine


# Create declarative base
Base: DeclarativeMeta = declarative_base()


class ModelDataDB(Base):
    """Database model for storing model data."""

    __tablename__ = "model_data"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    version = Column(String)
    endpoints = Column(JSON)
    facts = Column(JSON)


class EndpointDataDB(Base):
    """Database model for storing endpoint data."""

    __tablename__ = "endpoint_data"

    name = Column(String, primary_key=True, index=True)
    config = Column(JSON)
    evaluation_history = Column(JSON)
    logs = Column(JSON)
    models = Column(JSON)


async def init_models_db() -> None:
    """Initialize the database by creating all tables."""
    try:
        async with models_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logging.info("Database tables created successfully")
    except Exception as e:
        logging.error(f"Error creating database tables: {str(e)}")
        raise
