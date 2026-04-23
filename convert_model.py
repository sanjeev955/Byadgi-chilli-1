import tensorflow as tf

# Load your existing model
model = tf.keras.models.load_model("chilli_model_90.h5")

# Export to SavedModel format (folder)
model.export("model_fixed")

print("Model converted successfully!")