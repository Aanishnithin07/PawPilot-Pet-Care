import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if firebase_admin._apps:
        return  # Already initialized
    
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        # For testing, initialize with test credentials
        if os.getenv("TESTING") == "true":
            # Use test project credentials or mock
            try:
                firebase_admin.initialize_app(credentials.Certificate({
                    "type": "service_account",
                    "project_id": "test-project",
                    "private_key_id": "test-key-id",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nxhXctbdgZATkr+IfVVoEXGkRIdEMBMlldnIYsKlkLkmSWIFtszplFw==\n-----END PRIVATE KEY-----\n",
                    "client_email": "test@test-project.iam.gserviceaccount.com",
                    "client_id": "123456789",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }))
                return
            except:
                pass
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set")
    
    try:
        # Try to decode if it's base64 encoded
        try:
            decoded = base64.b64decode(service_account_json)
            service_account_info = json.loads(decoded)
        except:
            # If not base64, assume it's direct JSON
            service_account_info = json.loads(service_account_json)
        
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        raise ValueError(f"Failed to initialize Firebase: {str(e)}")

async def verify_firebase_token(id_token: str) -> dict:
    """Verify Firebase ID token and return user info"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture'),
            'email_verified': decoded_token.get('email_verified', False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )