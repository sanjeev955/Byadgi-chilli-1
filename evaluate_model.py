import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow import keras
import numpy as np

print("TensorFlow version:", tf.__version__)
print("GPU devices:", tf.config.list_physical_devices('GPU'))

# Load model
import glob

print("Loaded chilli_model_v3.h5")
print("Loaded chilli_model_v3.h5 (MobileNetV2)")
print("Model loaded!")

# Test dataset
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
test_set = test_datagen.flow_from_directory(
    './dataset/test',
    target_size=(224,224),
    batch_size=16,
    class_mode='categorical',
    shuffle=False
)

print(f"Test images: {test_set.samples}")
print("Class indices:", test_set.class_indices)

# Evaluate with progress
print("Evaluating...")
loss, accuracy = model.evaluate(test_set, verbose=1)
print(f"\n✓ Test Loss: {loss:.4f}")
print(f"✓ Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

print("Done!")
