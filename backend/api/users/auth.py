"""Handle authentication logic."""

from datetime import datetime, timedelta, UTC
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from api.users.data import TokenData, User
from api.users.db import get_db


SECRET_KEY = "your-secret-key"  # Change this to a secure random key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Parameters
    ----------
    plain_password : str
        The plain text password to verify.
    hashed_password : str
        The hashed password to compare against.

    Returns
    -------
    bool
        True if the password is correct, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password for storing.

    Parameters
    ----------
    password : str
        The plain text password to hash.

    Returns
    -------
    str
        The hashed password.
    """
    return pwd_context.hash(password)


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
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
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
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
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
    user = db.query(User).filter(User.username == token_data.username).first()
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user
