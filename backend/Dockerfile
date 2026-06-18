# Production container image for the EventRentHub FastAPI backend (Cloud Run).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY app ./app

# Cloud Run injects $PORT at runtime; bind to it on all interfaces.
# Shell form so ${PORT} expands; exec so uvicorn is PID 1 (clean shutdown).
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
