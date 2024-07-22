# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy the rest of the backend code
COPY . .

# Update pip and install poetry
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    python3 -m pip install --no-cache-dir poetry

# Install dependencies
RUN python3 -m poetry config virtualenvs.create false && \
    python3 -m poetry install --no-dev --no-interaction --no-ansi

# Expose the port the app runs on
EXPOSE 8000

# Start the app
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
