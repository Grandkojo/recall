#!/bin/bash

# Start the Celery worker in the background
celery -A app.core.celery_app worker --loglevel=info &

# Start the FastAPI app in the foreground
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
