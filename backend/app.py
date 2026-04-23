from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import cv2

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'model_fixed'

# Lazy load model
model = None
preprocess_input = None

def load_model_once():
    global model, preprocess_input
    if model is None:
        print("Loading model...")

        # Import inside to avoid startup delay
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as pp

        model = tf.keras.models.load_model(MODEL_PATH)
        preprocess_input = pp

        print("Model loaded successfully!")


# Class labels
class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']


# =========================
# 🎨 COLOR
# =========================
def get_color_hsv(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0].mean()

    if hue < 10:
        return "Deep Red"
    elif hue < 20:
        return "Red"
    elif hue < 30:
        return "Orange Red"
    else:
        return "Dull Color"


# =========================
# 📏 SIZE
# =========================
def get_size(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_red1 = np.array([0, 70, 50])
    upper_red1 = np.array([10, 255, 255])

    lower_red2 = np.array([160, 70, 50])
    upper_red2 = np.array([179, 255, 255])

    mask = cv2.inRange(hsv, lower_red1, upper_red1) + \
           cv2.inRange(hsv, lower_red2, upper_red2)

    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return "Unknown"

    c = max(contours, key=cv2.contourArea)
    perimeter = cv2.arcLength(c, True)

    img_h, img_w = img.shape[:2]
    norm_length = perimeter / (img_h + img_w)

    if norm_length < 0.25:
        return "Small"
    elif norm_length < 0.50:
        return "Medium"
    else:
        return "Large"


# =========================
# 🌊 WRINKLE
# =========================
def get_wrinkle(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()

    if score > 150:
        return "High"
    elif score > 80:
        return "Medium"
    else:
        return "Low"


# =========================
# FEATURE EXTRACTION
# =========================
def extract_features_from_array(image_array):
    img = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, (300, 300))

    return {
        "color": get_color_hsv(img),
        "size": get_size(img),
        "wrinkle": get_wrinkle(img)
    }


# =========================
# HOME ROUTE
# =========================
@app.route('/')
def home():
    return render_template_string("""
    <h1>Chilli Quality Classifier</h1>
    <form action="/predict" method="post" enctype="multipart/form-data">
        <input type="file" name="image" required>
        <input type="submit" value="Classify">
    </form>
    """)


# =========================
# PREDICT ROUTE
# =========================
@app.route('/predict', methods=['POST'])
def predict():
    load_model_once()

    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400

    file = request.files['image']

    image = Image.open(io.BytesIO(file.read())).convert('RGB')
    image_array = np.array(image)

    # Model input
    resized = cv2.resize(image_array, (224, 224))
    input_array = np.expand_dims(resized, axis=0)
    input_array = preprocess_input(input_array)

    predictions = model.predict(input_array)[0]

    return jsonify({
        'predicted_class': class_names[np.argmax(predictions)],
        'confidence': float(np.max(predictions)),
        'features': extract_features_from_array(image_array)
    })


