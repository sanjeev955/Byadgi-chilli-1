FROM python:3.10-slim

# Install system dependencies required by OpenCV and TensorFlow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and application code
COPY final_model.h5 .
COPY app.py .
COPY fix_model.py .

# Create fixed model fallback at build time
RUN python fix_model.py

EXPOSE 7860

CMD ["python", "app.py"]

