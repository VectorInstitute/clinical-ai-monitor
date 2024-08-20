"""Database module to store user information."""

from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base


# Use a local SQLite database
DATABASE_URL = "sqlite+aiosqlite:///./users.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base: Any = declarative_base()


async def init_db() -> None:
    """
    Initialize the database by creating all tables.

    This function should be called once at application startup.

    Returns
    -------
    None
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create and yield an asynchronous database session.

    This function is intended to be used as a dependency in FastAPI route functions.

    Yields
    ------
    AsyncSession
        An asynchronous SQLAlchemy session.

    Examples
    --------
    @app.get("/users")
    async def get_users(session: AsyncSession = Depends(get_async_session)):
        # Use the session here
        ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
