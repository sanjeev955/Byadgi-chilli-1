"""
Local FastAPI server that mimics Gradio 3.x /run/predict API.
Use this for local testing when gradio==3.50.2 cannot be installed (e.g. Python 3.13).
For Hugging Face deployment, use app.py (Gradio) with Python 3.10.
"""
import os
import base64
import io
import uvicorn
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Chilli Quality Classifier")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOAD MODEL
# =========================
MODEL_PATH = os.environ.get("MODEL_PATH", "final_model.h5")

model = None
for path in [MODEL_PATH, "final_model_fixed.h5"]:
    if os.path.exists(path):
        try:
            model = tf.keras.models.load_model(path, compile=False)
            print(f"✅ Model loaded successfully from: {path}")
            break
        except TypeError as e:
            print(f"⚠️ Failed to load {path}: {e}")
            continue

if model is None:
    raise RuntimeError(
        "Could not load model. "
        "If you see 'batch_shape/optional' errors, run: python fix_model.py"
    )

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']


# =========================
# FEATURE EXTRACTION
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


def get_size(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    count = np.sum(edges)
    if count < 5000:
        return "Small"
    elif count < 15000:
        return "Medium"
    else:
        return "Large"


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
# PREDICTION
# =========================
def predict(image):
    img = np.array(image.convert("RGB"))
    resized = cv2.resize(img, (64, 64))
    input_tensor = np.expand_dims(resized, axis=0)
    input_tensor = input_tensor / 255.0
    predictions = model.predict(input_tensor)[0]
    result = {
        class_names[i]: float(predictions[i])
        for i in range(len(class_names))
    }
    features = {
        "color": get_color_hsv(img),
        "size": get_size(img),
        "wrinkle": get_wrinkle(img)
    }
    return result, features


# =========================
# API ENDPOINTS
# =========================
@app.post("/run/predict")
async def run_predict(request: Request):
    body = await request.json()
    data = body.get("data", [])
    if not data or not data[0]:
        return JSONResponse({"data": [{"error": "No image provided"}, {}]})

    try:
        img_str = data[0]
        if "," in img_str:
            img_str = img_str.split(",")[1]
        img_bytes = base64.b64decode(img_str)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        result, features = predict(image)
        return JSONResponse({"data": [result, features]})
    except Exception as e:
        return JSONResponse({"data": [{"error": str(e)}, {}]})


@app.get("/")
async def root():
    return {"message": "Chilli Quality Classifier API is running. POST to /run/predict"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)

