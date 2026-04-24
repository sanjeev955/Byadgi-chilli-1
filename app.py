import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
import gradio as gr

model = tf.keras.models.load_model("final_model.h5", compile=False)

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']

def predict(image):
    img = np.array(image.convert("RGB"))

    resized = cv2.resize(img, (224, 224))
    input_tensor = np.expand_dims(resized, axis=0) / 255.0

    preds = model.predict(input_tensor)[0]

    result = {class_names[i]: float(preds[i]) for i in range(4)}
    predicted_class = max(result, key=result.get)
    confidence = result[predicted_class]

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "all_predictions": result
    }

demo = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil"),
    outputs=gr.JSON()
)

demo.launch()