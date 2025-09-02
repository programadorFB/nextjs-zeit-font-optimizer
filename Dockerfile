# Dockerfile para Betting Management Application

FROM python:3.11-slim-bullseye

# Configurações de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV GUNICORN_WORKERS=4
ENV GUNICORN_THREADS=2
ENV GUNICORN_TIMEOUT=120

# Diretório de trabalho
WORKDIR /app

# Instala dependências de sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements primeiro para otimizar cache
COPY backend/requirements.txt .

# Instala dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o projeto
COPY . .

# Cria diretórios para logs e uploads
RUN mkdir -p logs uploads && chmod 755 logs uploads

# Cria usuário não-root
RUN groupadd -r betting && useradd -r -g betting betting && \
    chown -R betting:betting /app

# Usa usuário não-root
USER betting

# Expõe porta padrão (o Render vai usar $PORT)
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Comando para iniciar Gunicorn
# Shell form é necessário para expansão de variável $PORT
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} \
             --workers ${GUNICORN_WORKERS} \
             --threads ${GUNICORN_THREADS} \
             --timeout ${GUNICORN_TIMEOUT} \
             backend.wsgi:app
