"""
FastAPI application for user authentication.

This module provides endpoints for user login and authentication.
"""

from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, Field


app = FastAPI(title="User Authentication API")
security = HTTPBasic()


class User(BaseModel):
    """
    Represents a user in the system.

    Attributes
    ----------
    username : str
        The username of the user.
    password : str
        The password of the user.
    """

    username: str = Field(..., description="The username of the user")
    password: str = Field(..., description="The password of the user")


# Mock data
USERS: List[Dict[str, str]] = [{"username": "hospital1", "password": "password123"}]


def get_current_user(
    credentials: HTTPBasicCredentials = Depends(security),
) -> Optional[Dict[str, str]]:
    """
    Authenticate and return the current user.

    Parameters
    ----------
    credentials : HTTPBasicCredentials
        The credentials provided by the user.

    Returns
    -------
    Optional[Dict[str, str]]
        The authenticated user if credentials are valid, None otherwise.

    Raises
    ------
    HTTPException
        If the credentials are invalid.
    """
    user = next(
        (user for user in USERS if user["username"] == credentials.username), None
    )
    if user is None or user["password"] != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user


@app.post("/login", summary="User login")
def login(current_user: Dict[str, str] = Depends(get_current_user)) -> Dict[str, str]:
    """
    Endpoint for user login.

    Parameters
    ----------
    current_user : Dict[str, str]
        The authenticated user, obtained from the get_current_user dependency.

    Returns
    -------
    Dict[str, str]
        A dictionary containing a success message.

    Raises
    ------
    HTTPException
        If the login fails due to invalid credentials.
    """
    return {"message": "Login successful"}
