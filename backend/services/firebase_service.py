import firebase_admin
from firebase_admin import credentials
from core.config import settings
import os

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    try:
        if not firebase_admin._apps:
            if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin Initialized successfully.")
            else:
                print(f"Warning: Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}. Firebase features will not work.")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
