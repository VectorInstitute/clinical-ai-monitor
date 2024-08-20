"""Utility functions for user management."""

from passlib.context import CryptContext


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    return bool(pwd_context.verify(plain_password, hashed_password))


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
    return str(pwd_context.hash(password))
