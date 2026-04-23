import os
import numpy as np
import cv2
import io
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
CORS(app)

MODEL_PATH = "final_model.h5"

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print("Model loaded!")

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']


@app.route('/')
def home():
    return "Chilli Classifier Running"


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400

        file = request.files['image']

        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        image_array = np.array(image)

        resized = cv2.resize(image_array, (224, 224))

        input_tensor = np.expand_dims(resized, axis=0)
        input_tensor = preprocess_input(input_tensor)
        input_tensor = input_tensor.astype(np.float32)

        predictions = model.predict(input_tensor)[0]

        return jsonify({
            'predicted_class': class_names[np.argmax(predictions)],
            'confidence': float(np.max(predictions))
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)