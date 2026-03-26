# Dockerfile for Baymax AI
# Build: docker build -t baymax-ai .
# Run: docker run -p 8501:8501 -e GROQ_API_KEY=... baymax-ai

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for ChromaDB
RUN mkdir -p data/chroma_db

# Expose Streamlit port
EXPOSE 8501

# Set environment variables
ENV STREAMLIT_SERVER_PORT=8501
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0
ENV STREAMLIT_SERVER_HEADLESS=true
ENV STREAMLIT_LOGGER_LEVEL=info

# Run Streamlit
CMD ["streamlit", "run", "app.py"]
