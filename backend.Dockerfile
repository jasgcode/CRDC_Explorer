# backend.Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app directory
COPY ./app ./app/

EXPOSE 5001

# Modify the Flask app to listen on 0.0.0.0
CMD ["python", "-c", "import os; os.environ['FLASK_RUN_HOST'] = '0.0.0.0'; from app.app import app; app.run(host='0.0.0.0', port=5001)"]