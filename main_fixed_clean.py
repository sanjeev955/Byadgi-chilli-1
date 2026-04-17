import os
import tensorflow as tf

# Enable mixed precision for 2-3x GPU speedup
from tensorflow.keras import mixed_precision
mixed_precision.set_global_policy('mixed_float16')

print("TensorFlow version:", tf.__version__)
print("GPU devices:", tf.config.list_physical_devices('GPU'))
print("Mixed precision:", tf.keras.mixed_precision.global_policy().name)

from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import cv2
import matplotlib.pyplot as plt
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

print("Dataset train dirs:", os.listdir('./dataset/train'))
print("Dataset test dirs:", os.listdir('./dataset/test'))

# Data Preprocessing - Fast training augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=30,
    zoom_range=0.3,
    shear_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.7,1.3],
    fill_mode='nearest')

# Load Training Dataset
training_set = train_datagen.flow_from_directory(
        './dataset/train',
        target_size=(224,224),
        batch_size=16,
        class_mode='categorical',
        shuffle=True)

# Load Test Dataset
test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
test_set = test_datagen.flow_from_directory(
        './dataset/test',
        target_size=(224,224),
        batch_size=16,
        class_mode='categorical',
        shuffle=False)

print("Class indices:", training_set.class_indices)

# Build MobileNetV2 Transfer Learning Model - Phase 1 & 2
base_model = tf.keras.applications.MobileNetV2(input_shape=(224,224,3), include_top=False, weights='imagenet')
base_model.trainable = False  # Phase 1: Freeze

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(4, activation='softmax', dtype='float32')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(model.summary())

callbacks = [
    tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
    tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=3, min_lr=1e-7, verbose=1),
    tf.keras.callbacks.ModelCheckpoint('chilli_model_v3.h5', monitor='val_accuracy', save_best_only=True, verbose=1)
]

print("Phase 1: Training top layers (frozen base)...")
history1 = model.fit(
    training_set,
    validation_data=test_set,
    epochs=20,
    callbacks=callbacks
)

# Phase 2: Fine-tuning
print("Phase 2: Fine-tuning last 30 layers...")
for layer in base_model.layers[-30:]:
    layer.trainable = True

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    training_set,
    validation_data=test_set,
    epochs=20,
    callbacks=callbacks
)

# Combine histories for plotting
for k in history2.history.keys():
    history1.history[k] = history1.history[k] + history2.history[k]

history = history1

print("Best model saved as chilli_model_v3.h5!")

# Plot training history
plt.figure(figsize=(12,4))
plt.subplot(1,2,1)
plt.plot(history.history['accuracy'], label='Train Acc')
plt.plot(history.history['val_accuracy'], label='Val Acc')
plt.title('Model Accuracy')
plt.legend()
plt.subplot(1,2,2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Model Loss')
plt.legend()
plt.savefig('training_history.png')
plt.show()
print("Training history saved as training_history.png")

print("Training complete! Expected ~90% val accuracy with MobileNetV2.")

