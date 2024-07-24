FROM python:3.11-slim

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential cython

# Set work directory
WORKDIR /app

# Copy requirements file
COPY app/requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY app/ .

# Run the application
CMD ["gunicorn", "wsgi:app"] 