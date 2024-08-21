"""Database configuration and session management."""

import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# User database configuration
USERS_DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'users.db')}"
users_engine = create_async_engine(USERS_DATABASE_URL, echo=False)
UsersAsyncSessionLocal = async_sessionmaker(
    users_engine, class_=AsyncSession, expire_on_commit=False
)

# Models database configuration
MODELS_DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'models.db')}"
models_engine = create_async_engine(MODELS_DATABASE_URL, echo=False)
ModelsAsyncSessionLocal = async_sessionmaker(
    models_engine, class_=AsyncSession, expire_on_commit=False
)


async def get_users_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Create and yield an asynchronous session for the users database."""
    async with UsersAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_models_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Create and yield an asynchronous session for the models database."""
    async with ModelsAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
