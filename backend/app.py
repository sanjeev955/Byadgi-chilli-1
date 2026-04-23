from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import cv2

app = Flask(__name__)
CORS(app)

MODEL_PATH = '../chilli_model_90.h5'
print(f"Loading model from {MODEL_PATH}...")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Class labels
class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']


# =========================
# 🎨 COLOR (HSV)
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
# 📏 SIZE (Small/Medium/Large)
# =========================
def get_size(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Red mask
    lower_red1 = np.array([0, 70, 50])
    upper_red1 = np.array([10, 255, 255])

    lower_red2 = np.array([160, 70, 50])
    upper_red2 = np.array([179, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)

    mask = mask1 + mask2

    # Clean mask
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return "Unknown"

    c = max(contours, key=cv2.contourArea)

    # 🔥 KEY: Use arc length (real curve length)
    perimeter = cv2.arcLength(c, True)

    # Normalize
    img_h, img_w = img.shape[:2]
    norm_length = perimeter / (img_h + img_w)

    # 🔧 Tune these based on your images
    if norm_length < 0.25:
        return "Small"
    elif norm_length < 0.50:
        return "Medium"
    else:
        return "Large"
    
# =========================
# 🌊 WRINKLE (Texture)
# =========================
def get_wrinkle(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    score = lap.var()

    if score > 150:
        return "High"
    elif score > 80:
        return "Medium"
    else:
        return "Low"


# =========================
# 🔥 MAIN FEATURE FUNCTION
# =========================
def extract_features_from_array(image_array):
    # Convert RGB → BGR (important for OpenCV)
    img = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, (300, 300))

    return {
        "color": get_color_hsv(img),
        "size": get_size(img),
        "wrinkle": get_wrinkle(img)
    }


# =========================
# 🏠 HOME ROUTE
# =========================
@app.route('/')
def home():
    return render_template_string('''
<!DOCTYPE html>
<html>
<head><title>Chilli Classifier</title></head>
<body>
    <h1>Chilli Quality Classifier</h1>
    <form action="/predict" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required>
        <input type="submit" value="Classify">
    </form>
</body>
</html>
    ''')


# =========================
# 🚀 PREDICT ROUTE
# =========================
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Load image
    image = Image.open(io.BytesIO(file.read())).convert('RGB')

    # Convert to array
    image_array = np.array(image)

    # ===== MODEL INPUT =====
    resized = cv2.resize(image_array, (224, 224))
    input_array = np.expand_dims(resized, axis=0)
    input_array = preprocess_input(input_array)

    # ===== PREDICTION =====
    predictions = model.predict(input_array)[0]
    predicted_class = class_names[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    # ===== FEATURE EXTRACTION (NEW) =====
    features = extract_features_from_array(image_array)

    return jsonify({
        'predicted_class': predicted_class,
        'confidence': confidence,
        'all_predictions': {
            class_names[i]: float(predictions[i])
            for i in range(len(predictions))
        },
        'features': features
    })


# =========================
# ▶ RUN
# =========================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)