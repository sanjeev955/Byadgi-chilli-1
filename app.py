import gradio as gr
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Load model
model = tf.keras.models.load_model("final_model.h5", compile=False)

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']

def predict(image):
    image = image.convert("RGB")
    image_array = np.array(image)

    resized = cv2.resize(image_array, (224, 224))
    input_tensor = np.expand_dims(resized, axis=0)
    input_tensor = preprocess_input(input_tensor)

    preds = model.predict(input_tensor)[0]

    return {
        class_names[i]: float(preds[i]) for i in range(4)
    }

iface = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=4),
    title="🌶️ Chilli Quality Classifier"
)

iface.launch()