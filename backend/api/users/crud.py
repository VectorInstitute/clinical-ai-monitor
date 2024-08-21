"""CRUD operations for user management."""

from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy import Boolean, Column, Integer, String, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.users.data import User, UserCreate
from api.users.db import Base
from api.users.utils import get_password_hash


class UserModel(Base):  # type: ignore
    """
    SQLAlchemy model for the users table.

    Attributes
    ----------
    id : int
        Primary key for the user.
    username : str
        Unique username for the user.
    email : str
        Unique email address for the user.
    hashed_password : str
        Hashed password for the user.
    is_active : bool
        Flag indicating if the user account is active.
    role : str
        Role of the user in the system.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)


async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    user_id : int
        The ID of the user to retrieve.

    Returns
    -------
    Optional[User]
        The user object if found, None otherwise.
    """
    result = await db.execute(select(UserModel).filter(UserModel.id == user_id))
    db_user = result.scalar_one_or_none()
    return User.from_orm(db_user) if db_user else None


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """
    Retrieve a user by their username.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    username : str
        The username of the user to retrieve.

    Returns
    -------
    Optional[User]
        The user object if found, None otherwise.
    """
    result = await db.execute(select(UserModel).filter(UserModel.username == username))
    db_user = result.scalar_one_or_none()
    return User.from_orm(db_user) if db_user else None


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Retrieve a list of users.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    skip : int, optional
        Number of users to skip, by default 0.
    limit : int, optional
        Maximum number of users to return, by default 100.

    Returns
    -------
    List[User]
        List of user objects.
    """
    result = await db.execute(select(UserModel).offset(skip).limit(limit))
    return [User.from_orm(user) for user in result.scalars().all()]


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """
    Create a new user.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    user : UserCreate
        The user data to create.

    Returns
    -------
    User
        The created user object.
    """
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password,
        is_active=True,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return User.from_orm(db_user)


async def update_user(db: AsyncSession, user_id: int, user_update: UserCreate) -> User:
    """
    Update an existing user.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    user_id : int
        The ID of the user to update.
    user_update : UserCreate
        The updated user data.

    Returns
    -------
    User
        The updated user object.

    Raises
    ------
    ValueError
        If the user is not found.
    """
    result = await db.execute(select(UserModel).filter(UserModel.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise ValueError("User not found")

    db_user.username = user_update.username
    db_user.email = user_update.email
    db_user.role = user_update.role
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)

    await db.commit()
    await db.refresh(db_user)
    return User.from_orm(db_user)


async def create_initial_admin(db: AsyncSession) -> User:
    """
    Create the initial admin user if it doesn't exist.

    Parameters
    ----------
    db : AsyncSession
        The database session.

    Returns
    -------
    User
        The admin user object.
    """
    admin_user = await get_user_by_username(db, username="admin")
    if not admin_user:
        hashed_password = get_password_hash("admin_password")  # Use a secure password
        admin_user = UserModel(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True,
            role="admin",
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
    return User.from_orm(admin_user)


async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """
    Delete a user by their ID.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    user_id : int
        The ID of the user to delete.

    Returns
    -------
    bool
        True if the user was deleted, False otherwise.
    """
    result = await db.execute(select(UserModel).filter(UserModel.id == user_id))
    db_user = result.scalar_one_or_none()
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return True
    return False


async def update_user_password(
    db: AsyncSession, user_id: int, new_password: str
) -> None:
    """
    Update a user's password.

    Parameters
    ----------
    db : AsyncSession
        The database session.
    user_id : int
        The ID of the user to update.
    new_password : str
        The new password to set.

    Raises
    ------
    HTTPException
        If the user is not found.
    """
    stmt = select(UserModel).where(UserModel.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(new_password)
    db.add(user)
