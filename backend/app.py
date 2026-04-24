import os
import io
import base64
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
import gradio as gr
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

# =========================
# LOAD MODEL
# =========================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(SCRIPT_DIR, "final_model.h5"))
FIXED_PATH = os.path.join(SCRIPT_DIR, "final_model_fixed.h5")

model = None
for path in [MODEL_PATH, FIXED_PATH]:
    if os.path.exists(path):
        try:
            model = tf.keras.models.load_model(path, compile=False)
            print(f"✅ Model loaded successfully from: {path}")
            break
        except Exception as e:
            print(f"⚠️ Failed to load {path}: {e}")

if model is None:
    raise RuntimeError("❌ Model loading failed.")

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']

# =========================
# FEATURES
# =========================
def get_color_hsv(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0].mean()
    if hue < 10: return "Deep Red"
    elif hue < 20: return "Red"
    elif hue < 30: return "Orange Red"
    else: return "Dull Color"

def get_size(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    count = np.sum(edges)
    if count < 5000: return "Small"
    elif count < 15000: return "Medium"
    else: return "Large"

def get_wrinkle(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if score > 150: return "High"
    elif score > 80: return "Medium"
    else: return "Low"

# =========================
# MODEL FUNCTION
# =========================
def run_model(image: Image.Image):
    img = np.array(image.convert("RGB"))

    resized = cv2.resize(img, (224, 224))
    input_tensor = np.expand_dims(resized, axis=0) / 255.0

    preds = model.predict(input_tensor)[0]

    result = {class_names[i]: float(preds[i]) for i in range(len(class_names))}

    predicted_class = max(result, key=result.get)
    confidence = float(result[predicted_class])

    features = {
        "color": get_color_hsv(img),
        "size": get_size(img),
        "wrinkle": get_wrinkle(img)
    }

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "all_predictions": result,
        "features": features
    }

# =========================
# GRADIO UI
# =========================
demo = gr.Interface(
    fn=run_model,
    inputs=gr.Image(type="pil"),
    outputs=gr.JSON(),
    title="🌶️ Chilli Quality Classifier"
)

# =========================
# FASTAPI API
# =========================
api = FastAPI()

@api.post("/run/predict")
async def predict_api(request: Request):
    try:
        body = await request.json()
        img_str = body["data"][0]

        if "," in img_str:
            img_str = img_str.split(",")[1]

        img_bytes = base64.b64decode(img_str)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        result = run_model(image)

        # ✅ IMPORTANT FIX
        return JSONResponse({
            "data": [result]
        })

    except Exception as e:
        return JSONResponse({
            "data": [{
                "error": str(e)
            }]
        })

# =========================
# MOUNT GRADIO
# =========================
api = gr.mount_gradio_app(api, demo, path="/")

# =========================
# RUN
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(api, host="0.0.0.0", port=port)