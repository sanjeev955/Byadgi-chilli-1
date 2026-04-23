import io
import logging
import os
import threading

import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ==========================
# CONFIG
# ==========================
MODEL_PATH = 'model_fixed'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_FILE_SIZE_MB = 10
CONFIDENCE_THRESHOLD = 0.50
CLASS_NAMES = ['DHQ', 'DLQ', 'KHQ', 'KLQ']

COLOR_HUE_DEEP_RED  = 10
COLOR_HUE_RED       = 20
COLOR_HUE_ORANGE    = 30
SIZE_NORM_SMALL     = 0.25
SIZE_NORM_MEDIUM    = 0.50
WRINKLE_HIGH        = 150
WRINKLE_MEDIUM      = 80

# ==========================
# APP SETUP
# ==========================
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================
# THREAD-SAFE MODEL LOADING
# ==========================
model = None
_model_lock = threading.Lock()

def load_model_once():
    global model
    if model is None:
        with _model_lock:
            if model is None:
                logger.info("Loading model...")
                model = tf.keras.models.load_model(MODEL_PATH)
                logger.info("Model loaded successfully.")

# Pre-load at startup so first request is fast
load_model_once()

# ==========================
# COLOR
# ==========================
def get_color_hsv(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0].mean()
    if hue < COLOR_HUE_DEEP_RED:
        return "Deep Red"
    elif hue < COLOR_HUE_RED:
        return "Red"
    elif hue < COLOR_HUE_ORANGE:
        return "Orange Red"
    return "Dull Color"

# ==========================
# SIZE
# ==========================
def get_size(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = (
        cv2.inRange(hsv, np.array([0, 70, 50]),   np.array([10, 255, 255])) +
        cv2.inRange(hsv, np.array([160, 70, 50]), np.array([179, 255, 255]))
    )
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return "Unknown"
    c = max(contours, key=cv2.contourArea)
    perimeter = cv2.arcLength(c, True)
    norm_length = perimeter / sum(img.shape[:2])
    if norm_length < SIZE_NORM_SMALL:
        return "Small"
    elif norm_length < SIZE_NORM_MEDIUM:
        return "Medium"
    return "Large"

# ==========================
# WRINKLE
# ==========================
def get_wrinkle(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if score > WRINKLE_HIGH:
        return "High"
    elif score > WRINKLE_MEDIUM:
        return "Medium"
    return "Low"

# ==========================
# FEATURE EXTRACTION
# ==========================
def extract_features(image_array):
    img = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, (300, 300))
    return {
        "color":   get_color_hsv(img),
        "size":    get_size(img),
        "wrinkle": get_wrinkle(img),
    }

# ==========================
# ROUTES
# ==========================
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

@app.route('/')
def home():
    return render_template_string("""
    <h1>Chilli Quality Classifier</h1>
    <form action="/predict" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required>
        <input type="submit" value="Classify">
    </form>
    """)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    # File type check
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': f'Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}'}), 400

    # File size check
    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        return jsonify({'error': f'File too large. Max: {MAX_FILE_SIZE_MB}MB'}), 413

    try:
        image = Image.open(io.BytesIO(file_bytes)).convert('RGB')
        image_array = np.array(image)

        resized = cv2.resize(image_array, (224, 224))
        input_tensor = preprocess_input(np.expand_dims(resized, axis=0))

        predictions = model.predict(input_tensor)[0]
        confidence = float(np.max(predictions))
        predicted_class = CLASS_NAMES[np.argmax(predictions)]

        if confidence < CONFIDENCE_THRESHOLD:
            return jsonify({
                'predicted_class': None,
                'confidence': round(confidence, 4),
                'message': 'Confidence too low. Please use a clearer image.',
                'features': extract_features(image_array),
            }), 200

        return jsonify({
            'predicted_class': predicted_class,
            'confidence': round(confidence, 4),
            'features': extract_features(image_array),
        })

    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error during prediction'}), 500

# ==========================
# ENTRY POINT
# ==========================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
