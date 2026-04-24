import requests
import base64

with open("byadagi-1.png", "rb") as f:
    encoded = base64.b64encode(f.read()).decode()

payload = {
    "data": ["data:image/png;base64," + encoded]
}

res = requests.post("http://127.0.0.1:8000/run/predict", json=payload)

print(res.json())