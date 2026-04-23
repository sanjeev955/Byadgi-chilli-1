import io
import logging
import os
import threading

import cv2
import numpy as np
from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from PIL import Image

# ==========================
# CONFIG
# ==========================
MODEL_PATH = 'model_fixed'
CLASS_NAMES = ['DHQ', 'DLQ', 'KHQ', 'KLQ']
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# ==========================
# APP SETUP
# ==========================
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================
# MODEL (LAZY LOAD)
# ==========================
model = None
preprocess_input = None
_model_lock = threading.Lock()

def load_model_once():
    global model, preprocess_input

    if model is None:
        with _model_lock:
            if model is None:
                logger.info("Loading model...")

                import tensorflow as tf
                from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as pp

                model = tf.keras.models.load_model(MODEL_PATH)
                preprocess_input = pp

                logger.info("Model loaded successfully!")

# ==========================
# FEATURE EXTRACTION
# ==========================
def extract_features(image_array):
    img = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, (300, 300))

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0].mean()

    if hue < 10:
        color = "Deep Red"
    elif hue < 20:
        color = "Red"
    elif hue < 30:
        color = "Orange Red"
    else:
        color = "Dull Color"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    wrinkle_score = cv2.Laplacian(gray, cv2.CV_64F).var()

    if wrinkle_score > 150:
        wrinkle = "High"
    elif wrinkle_score > 80:
        wrinkle = "Medium"
    else:
        wrinkle = "Low"

    return {
        "color": color,
        "wrinkle": wrinkle
    }

# ==========================
# ROUTES
# ==========================
@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/')
def home():
    return render_template_string("""
    <h1>Chilli Quality Classifier</h1>
    <form action="/predict" method="post" enctype="multipart/form-data">
        <input type="file" name="image" required>
        <input type="submit" value="Classify">
    </form>
    """)

@app.route('/predict', methods=['POST'])
def predict():
    # ✅ Load model only when needed
    load_model_once()

    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400

    file = request.files['image']

    # Validate extension
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        image_array = np.array(image)

        resized = cv2.resize(image_array, (224, 224))
        input_tensor = np.expand_dims(resized, axis=0)
        input_tensor = preprocess_input(input_tensor)

        predictions = model.predict(input_tensor)[0]

        predicted_class = CLASS_NAMES[np.argmax(predictions)]
        confidence = float(np.max(predictions))

        return jsonify({
            'predicted_class': predicted_class,
            'confidence': round(confidence, 4),
            'features': extract_features(image_array)
        })

    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        return jsonify({'error': 'Prediction failed'}), 500


# ==========================
# ENTRY POINT (LOCAL ONLY)
# ==========================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
