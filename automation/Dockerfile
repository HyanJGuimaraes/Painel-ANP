# Use lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY src/ src/
COPY data/ data/
# Note: we might not want to copy data if it's a volume, but for initial seed it's fine.
# Ideally data/ should be a volume or ignored.

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Command to run the pipeline
CMD ["python", "src/main.py"]
