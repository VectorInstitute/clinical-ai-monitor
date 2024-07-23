# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy only the necessary files for dependency installation
COPY . .

# Update pip and install poetry
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    python3 -m pip install --no-cache-dir poetry

# Configure poetry to create the virtualenv in the project directory
RUN python3 -m poetry config virtualenvs.in-project true

# Install dependencies
RUN python3 -m poetry install --no-dev --no-interaction --no-ansi

# Expose the port the app runs on
EXPOSE 8000

# Start the app using poetry run
CMD ["/bin/bash", "-c", "source /app/.venv/bin/activate && uvicorn api.main:app --host 0.0.0.0 --port 8000"]
