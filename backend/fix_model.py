import h5py
import json
import shutil
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "final_model.h5")
FIXED_PATH = os.path.join(SCRIPT_DIR, "final_model_fixed.h5")

print("Opening model file...")

# Make a copy so we don't destroy the original
shutil.copy(MODEL_PATH, FIXED_PATH)

with h5py.File(FIXED_PATH, "r+") as f:
    model_config = f.attrs.get("model_config")

    if model_config is None:
        raise ValueError("Model config not found")

    # Decode if stored as bytes
    if isinstance(model_config, bytes):
        model_config = model_config.decode("utf-8")

    model_config = json.loads(model_config)

    print("Fixing layers...")

    for layer in model_config["config"]["layers"]:
        if layer["class_name"] == "InputLayer":
            config = layer["config"]

            # Remove Keras 3 incompatible keys
            config.pop("batch_shape", None)
            config.pop("optional", None)

            # Match the training input shape used by app.py (64, 64, 3)
            if "batch_input_shape" not in config:
                config["batch_input_shape"] = [None, 64, 64, 3]

    # Save fixed config back to the copied file
    f.attrs["model_config"] = json.dumps(model_config)

print(f"✅ Model config fixed successfully! Saved to: {FIXED_PATH}")

