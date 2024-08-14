"""CRUD operations for user management."""

from typing import List, Optional

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import Session

from api.users.data import User, UserCreate
from api.users.db import Base
from api.users.utils import get_password_hash


class UserModel(Base):
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


def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Parameters
    ----------
    db : Session
        The database session.
    user_id : int
        The ID of the user to retrieve.

    Returns
    -------
    Optional[User]
        The user if found, None otherwise.
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    return User.from_orm(db_user) if db_user else None


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Retrieve a user by their username.

    Parameters
    ----------
    db : Session
        The database session.
    username : str
        The username of the user to retrieve.

    Returns
    -------
    Optional[User]
        The user if found, None otherwise.
    """
    db_user = db.query(UserModel).filter(UserModel.username == username).first()
    if db_user:
        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            role=db_user.role,
            is_active=db_user.is_active,
            hashed_password=db_user.hashed_password,
        )
    return None


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Retrieve a list of users.

    Parameters
    ----------
    db : Session
        The database session.
    skip : int, optional
        The number of users to skip, by default 0.
    limit : int, optional
        The maximum number of users to return, by default 100.

    Returns
    -------
    List[User]
        A list of User objects.
    """
    db_users = db.query(UserModel).offset(skip).limit(limit).all()
    return [User.from_orm(db_user) for db_user in db_users]


def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user.

    Parameters
    ----------
    db : Session
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
    db.commit()
    db.refresh(db_user)
    return User.from_orm(db_user)


def update_user(db: Session, user: User, user_update: UserCreate) -> User:
    """
    Update an existing user.

    Parameters
    ----------
    db : Session
        The database session.
    user : User
        The existing user to update.
    user_update : UserCreate
        The new user data to apply.

    Returns
    -------
    User
        The updated user object.
    """
    db_user = db.query(UserModel).filter(UserModel.id == user.id).first()
    if not db_user:
        raise ValueError("User not found")

    db_user.username = user_update.username
    db_user.email = user_update.email
    db_user.role = user_update.role
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)

    db.commit()
    db.refresh(db_user)
    return User.from_orm(db_user)


def create_initial_admin(db: Session) -> User:
    """
    Create the initial admin user if it doesn't exist.

    Parameters
    ----------
    db : Session
        The database session.

    Returns
    -------
    User
        The created or existing admin user.
    """
    admin_user = get_user_by_username(db, username="admin")
    if not admin_user:
        hashed_password = get_password_hash(
            "admin_password"
        )  # Change this to a secure password
        admin_user = UserModel(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True,
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    return User.from_orm(admin_user)
