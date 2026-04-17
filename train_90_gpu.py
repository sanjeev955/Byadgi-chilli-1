import os
import tensorflow as tf
from tensorflow.keras import mixed_precision
mixed_precision.set_global_policy('mixed_float16')

print("TensorFlow version:", tf.__version__)
print("GPU devices:", tf.config.list_physical_devices('GPU'))

from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import cv2
import matplotlib.pyplot as plt
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

print("Dataset train dirs:", os.listdir('./dataset/train'))
print("Dataset test dirs:", os.listdir('./dataset/test'))

# Compute class weights
classes = ['DHQ', 'DLQ', 'KHQ', 'KLQ']
class_numbers = [0,1,2,3]
train_counts = {'DHQ': 1604, 'DLQ': 1483, 'KHQ': 1674, 'KLQ': 1880} # from count
total = sum(train_counts.values())
class_weight_dict = {i: total / (len(classes) * count) for i, (cls, count) in enumerate(train_counts.items())}
print("Class weights:", class_weight_dict)

# Data Preprocessing - Heavy augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=40,
    width_shift_range=0.3,
    height_shift_range=0.3,
    shear_range=0.3,
    zoom_range=0.4,
    horizontal_flip=True,
    vertical_flip=True,
    brightness_range=[0.6,1.4],
    channel_shift_range=20.0,
    fill_mode='nearest')

test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

training_set = train_datagen.flow_from_directory(
    './dataset/train',
    target_size=(224,224),
    batch_size=32,  # Larger batch
    class_mode='categorical',
    shuffle=True)

test_set = test_datagen.flow_from_directory(
    './dataset/test',
    target_size=(224,224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False)

print("Class indices:", training_set.class_indices)

# Model
base_model = tf.keras.applications.MobileNetV2(input_shape=(224,224,3), include_top=False, weights='imagenet')
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(4, activation='softmax', dtype='float32')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(model.summary())

# Callbacks
callbacks = [
    EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=1e-8),
    ModelCheckpoint('chilli_model_90.h5', monitor='val_accuracy', save_best_only=True)
]

# Phase 1: Top layers
print("Phase 1: Top layers frozen base...")
history1 = model.fit(
    training_set,
    validation_data=test_set,
    epochs=50,
    class_weight=class_weight_dict,
    callbacks=callbacks)

# Phase 2: Fine-tune top 100 layers
print("Phase 2: Fine-tune top 100 layers...")
base_model.trainable = True
for layer in base_model.layers[:-100]:
    layer.trainable = False

model.compile(optimizer=tf.keras.optimizers.Adam(1e-4), loss='categorical_crossentropy', metrics=['accuracy'])

history2 = model.fit(training_set, validation_data=test_set, epochs=40, class_weight=class_weight_dict, callbacks=callbacks)

# Phase 3: Full fine-tune
print("Phase 3: Full fine-tune...")
base_model.trainable = True

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy'])

history3 = model.fit(training_set, validation_data=test_set, epochs=30, class_weight=class_weight_dict, callbacks=callbacks)

# Plot
plt.figure(figsize=(12,4))
plt.subplot(1,2,1)
plt.plot(history1.history['val_accuracy'] + history2.history['val_accuracy'] + history3.history['val_accuracy'], label='Val Acc')
plt.title('Validation Accuracy')
plt.legend()
plt.subplot(1,2,2)
plt.plot(history1.history['loss'] + history2.history['loss'] + history3.history['loss'], label='Loss')
plt.legend()
plt.savefig('training_history_90.png')
plt.show()

print("Training complete! Model saved as chilli_model_90.h5")

