# Use an official Python runtime as a parent image
# Slim version to keep size down, though ML libs are large
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (needed for some python packages like cv2 or others if added later)
# libgl1-mesa-glx might be needed for opencv-python-headless if used, often common in ML
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# --no-cache-dir to keep image size smaller
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Define environment variable
ENV PORT=8000

# Run app.py when the container launches
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
