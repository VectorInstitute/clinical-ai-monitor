"""Authentication and authorization utilities."""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from api.users.crud import get_user_by_username
from api.users.data import TokenData, User
from api.users.db import get_db
from api.users.utils import verify_password


# Constants
SECRET_KEY = "7f5157dd32f573a237cce2f2e83f88342a5034f3c9273c6104765dbef8e824f6"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user by username and password.

    Parameters
    ----------
    db : Session
        The database session.
    username : str
        The username to authenticate.
    password : str
        The password to verify.

    Returns
    -------
    Optional[User]
        The authenticated user if successful, None otherwise.
    """
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a new access token.

    Parameters
    ----------
    data : Dict[str, Any]
        The data to encode in the token.
    expires_delta : Optional[timedelta], optional
        The expiration time for the token, by default None.

    Returns
    -------
    str
        The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from the token.

    Parameters
    ----------
    token : str
        The JWT token.
    db : Session
        The database session.

    Returns
    -------
    User
        The authenticated user.

    Raises
    ------
    HTTPException
        If the token is invalid or the user is not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current active user.

    Parameters
    ----------
    current_user : User
        The current authenticated user.

    Returns
    -------
    User
        The current active user.

    Raises
    ------
    HTTPException
        If the user is inactive.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
