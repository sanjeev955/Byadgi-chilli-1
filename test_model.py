import sys
try:
    import tensorflow as tf
    print("TensorFlow imported successfully")
    print("TensorFlow version:", tf.__version__)
except ImportError as e:
    print("TensorFlow not available:", e)

try:
    import h5py
    print("h5py imported successfully")
except ImportError as e:
    print("h5py not available:", e)

import os
print("Files in current directory:")
for f in os.listdir('.'):
    print(f"  {f}")

model_path = 'chilli_model_v3.h5'
if os.path.exists(model_path):
    print(f"Model file {model_path} exists ({os.path.getsize(model_path)/1024/1024:.1f} MB)")
    
    # Try to read model metadata without full TF
    try:
        import h5py
        with h5py.File(model_path, 'r') as f:
            print("Model structure:")
            def print_structure(name, obj):
                print(f"  {name}")
            f.visititems(print_structure)
    except Exception as e:
        print("Could not read model structure:", e)
else:
    print(f"Model file {model_path} NOT found")

print("Basic dependencies check complete")

