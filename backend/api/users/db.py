"""Database module to store user information."""

from typing import Any

from sqlalchemy.orm import declarative_base

from api.db_config import users_engine


Base: Any = declarative_base()


async def init_users_db() -> None:
    """
    Initialize the database by creating all tables.

    This function should be called once at application startup.

    Returns
    -------
    None
    """
    async with users_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
