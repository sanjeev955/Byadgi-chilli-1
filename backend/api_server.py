from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf

app = FastAPI()

# =========================
# CORS (for frontend)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOAD MODEL
# =========================
model = tf.keras.models.load_model("final_model.h5", compile=False)

class_names = ['DHQ', 'DLQ', 'KHQ', 'KLQ']


# =========================
# FEATURES
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
# CORE PREDICTION
# =========================
def predict_image(image):
    img = np.array(image.convert("RGB"))

    resized = cv2.resize(img, (224, 224))
    input_tensor = np.expand_dims(resized, axis=0) / 255.0

    preds = model.predict(input_tensor)[0]

    result = {class_names[i]: float(preds[i]) for i in range(4)}

    predicted_class = max(result, key=result.get)
    confidence = result[predicted_class]

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
# API ROUTE
# =========================
@app.post("/run/predict")
async def run_predict(req: dict):
    try:
        print("📥 Request received")

        if "data" not in req:
            return {"data": [{"error": "Missing 'data' field"}]}

        img_str = req["data"][0]

        # remove base64 prefix if exists
        if "," in img_str:
            img_str = img_str.split(",")[1]

        # decode image
        image = Image.open(io.BytesIO(base64.b64decode(img_str))).convert("RGB")

        result = predict_image(image)

        print("✅ Prediction success:", result["predicted_class"])

        return {"data": [result]}

    except Exception as e:
        print("❌ ERROR:", e)

        return {"data": [{"error": str(e)}]}


# =========================
# HEALTH CHECK (IMPORTANT)
# =========================
@app.get("/")
def home():
    return {"status": "API running 🚀"}