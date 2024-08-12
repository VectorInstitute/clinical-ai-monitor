"""Database to store user information."""

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker


# Use a local SQLite database
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.

    Yields
    ------
    Session
        A SQLAlchemy database session.

    Raises
    ------
    Exception
        Any exception that occurs during database operations.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
