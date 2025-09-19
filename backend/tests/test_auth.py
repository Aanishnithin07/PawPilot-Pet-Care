import pytest
from unittest.mock import patch, AsyncMock
from fastapi import HTTPException
from auth import get_current_user, verify_firebase_token
from database import get_db
import models

class TestFirebaseAuth:
    
    def test_verify_token_endpoint(self, client, mock_verify_firebase_token, auth_headers):
        """Test the token verification endpoint"""
        response = client.post("/verify", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "user_id" in data

    def test_get_current_user_info(self, client, mock_verify_firebase_token, auth_headers):
        """Test getting current user info"""
        response = client.get("/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["firebase_uid"] == "test-firebase-uid-123"

    def test_unauthorized_access(self, client):
        """Test accessing protected endpoint without token"""
        response = client.get("/me")
        assert response.status_code == 401

    def test_invalid_token_format(self, client):
        """Test invalid authorization header format"""
        headers = {"Authorization": "InvalidFormat token"}
        response = client.get("/me", headers=headers)
        assert response.status_code == 401

    @patch('auth.verify_firebase_token')
    def test_invalid_firebase_token(self, mock_verify, client):
        """Test invalid Firebase token"""
        mock_verify.side_effect = HTTPException(status_code=401, detail="Invalid token")
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/me", headers=headers)
        assert response.status_code == 401

    def test_user_creation_on_first_login(self, client, mock_verify_firebase_token, auth_headers):
        """Test that user is created in database on first Firebase login"""
        # First request should create user
        response = client.get("/me", headers=auth_headers)
        assert response.status_code == 200
        
        # Second request should use existing user
        response = client.get("/me", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == "test@example.com"