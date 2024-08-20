"""Pydantic data classes for authentication and user management."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """
    Represents an authentication token.

    Attributes
    ----------
    access_token : str
        The access token string.
    token_type : str
        The type of the token (e.g., "bearer").
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Represents the data contained in a token.

    Attributes
    ----------
    username : Optional[str]
        The username associated with the token, if any.
    """

    username: Optional[str] = None


class UserBase(BaseModel):
    """
    Base model for user data.

    Attributes
    ----------
    username : str
        The user's username.
    email : EmailStr
        The user's email address.
    role : str
        The user's role in the system.
    """

    username: str
    email: EmailStr
    role: str


class UserCreate(UserBase):
    """
    Model for creating a new user, extending UserBase.

    Attributes
    ----------
    password : str
        The user's password (in plain text for creation, will be hashed before storage).
    """

    password: str


class User(UserBase):
    """
    Model representing a user in the system, extending UserBase.

    Attributes
    ----------
    id : int
        The unique identifier for the user.
    is_active : bool
        Flag indicating whether the user account is active.
    hashed_password: str
        Hashed password.

    Config
    ------
    orm_mode : bool
        Allows the model to be read from ORM objects.
    """

    id: int
    is_active: bool
    hashed_password: str

    class Config:
        """Override config."""

        orm_mode = True
