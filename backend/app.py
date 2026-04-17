from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import base64

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

# Class names from training (DHQ, DLQ, KHQ, KLQ)
class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']

@app.route('/')
def home():
    return render_template_string('''
<!DOCTYPE html>
<html>
<head><title>Chilli Classifier</title></head>
<body>
    <h1>Chilli Quality Classifier (MobileNetV2 v3)</h1>
    <form action="/predict" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required>
        <input type="submit" value="Classify">
    </form>
</body>
</html>
    ''')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Load and preprocess image
    image = Image.open(io.BytesIO(file.read())).convert('RGB')
    image = image.resize((224, 224))
    image_array = np.array(image)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = preprocess_input(image_array)
    
    # Predict
    predictions = model.predict(image_array)[0]
    predicted_class = class_names[np.argmax(predictions)]
    confidence = float(np.max(predictions))
    
    return jsonify({
        'predicted_class': predicted_class,
        'confidence': confidence,
        'all_predictions': {class_names[i]: float(predictions[i]) for i in range(len(predictions))}
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

