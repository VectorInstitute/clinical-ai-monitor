# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()


# Pydantic models
class User(BaseModel):
    username: str
    password: str


# Mock data
users = [{"username": "hospital1", "password": "password123"}]


# Authentication dependency
def get_current_user(username: str, password: str):
    user = next((user for user in users if user["username"] == username), None)
    if user is None or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


@app.post("/login")
def login(user: User):
    if get_current_user(user.username, user.password):
        return {"message": "Login successful"}
