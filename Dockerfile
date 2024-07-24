FROM python:3.11-slim

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential cython

# Set work directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Run the application
CMD ["gunicorn", "wsgi:app"] 