import os
import firebase_admin
from firebase_admin import credentials

# Get the absolute path of the project directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define the path to the service account key
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, 'config', 'serviceAccountKey.json')

# Check if the file exists
if not os.path.exists(SERVICE_ACCOUNT_PATH):
    raise FileNotFoundError(f"Service account key not found at {SERVICE_ACCOUNT_PATH}")

# Initialize Firebase
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://finalsemproject1-83e7e-default-rtdb.firebaseio.com'  # Add your actual Firebase URL
})
