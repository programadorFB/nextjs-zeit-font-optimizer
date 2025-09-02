FROM python:3.11-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV FLASK_APP=backend/run.py
ENV GUNICORN_WORKERS=4
ENV GUNICORN_THREADS=2
ENV GUNICORN_TIMEOUT=120

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project
COPY . .

# Create logs and uploads directories
RUN mkdir -p logs uploads && chmod 755 logs uploads

# Create non-root user
RUN groupadd -r betting && useradd -r -g betting betting && \
    chown -R betting:betting /app

USER betting

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Use shell form for PORT expansion
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} \
             --workers ${GUNICORN_WORKERS} \
             --threads ${GUNICORN_THREADS} \
             --timeout ${GUNICORN_TIMEOUT} \
