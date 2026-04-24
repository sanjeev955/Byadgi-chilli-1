# Byadgi Chilli Quality Grading — Backend

Gradio-based backend for the chilli image classifier.

## Expected Response Format

The `/run/predict` endpoint (auto-created by Gradio) returns:

```json
{
  "data": [
    {
      "DHQ": 0.05,
      "DLQ": 0.10,
      "KHQ": 0.75,
      "KLQ": 0.10
    },
    {
      "color": "Deep Red",
      "size": "Medium",
      "wrinkle": "Low"
    }
  ]
}
```

- `data[0]` — prediction scores for each grade
- `data[1]` — extracted features (color, size, wrinkle)

## Deployment Options

### 1. Hugging Face Spaces (Docker)
1. Create a new Space on Hugging Face.
2. Select **Docker** as the SDK.
3. Upload the contents of this `backend/` folder.
4. The Space will build from the provided `Dockerfile`.

### 2. Render (Docker)
1. Create a new Web Service on Render.
2. Connect your repository and point to the `backend/` directory.
3. Select **Docker** runtime.
4. Set `PORT` environment variable to `7860` if needed.

### 3. Local Server
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The app will be available at `http://localhost:7860`.

## Model Compatibility Notes

- The `.h5` model was trained with TensorFlow ~2.10–2.12.
- `requirements.txt` pins `tensorflow==2.12.1` to guarantee compatibility.
- If you still encounter `TypeError: Unrecognized keyword arguments: ['batch_shape', 'optional']`, run:
  ```bash
  python fix_model.py
  ```
  This creates a patched `final_model_fixed.h5` with the incompatible keys removed. `app.py` will automatically fall back to it.

