import tensorflow as tf
from PIL import Image
import numpy as np
import io

# Load a powerful, pre-trained model from TensorFlow once when the server starts
model = tf.keras.applications.MobileNetV2(weights='imagenet')

def preprocess_image(image_bytes):
    """Resizes and formats the image to what MobileNetV2 expects."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

def analyze_image(image_bytes):
    """Analyzes an image and returns the top prediction."""
    preprocessed_image = preprocess_image(image_bytes)
    predictions = model.predict(preprocessed_image)
    # Decode the predictions into human-readable labels
    decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=1)

    # Get the top prediction's name and confidence score
    top_prediction = decoded_predictions[0][0]
    label = top_prediction[1].replace('_', ' ').title()
    score = float(top_prediction[2])

    return {"label": label, "confidence": score}