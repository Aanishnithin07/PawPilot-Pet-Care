import pytest

class TestPetsAPI:
    
    def test_create_pet(self, client, mock_verify_firebase_token, auth_headers):
        """Test creating a new pet"""
        pet_data = {
            "name": "Buddy",
            "breed": "Golden Retriever",
            "age": 3,
            "weight": 25.5
        }
        
        response = client.post("/pets/", json=pet_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Buddy"
        assert data["breed"] == "Golden Retriever"
        assert data["age"] == 3
        assert data["weight"] == 25.5
        assert "id" in data
        assert "owner_id" in data

    def test_get_user_pets(self, client, mock_verify_firebase_token, auth_headers):
        """Test getting user's pets"""
        # First create a pet
        pet_data = {
            "name": "Max",
            "breed": "Labrador",
            "age": 2,
            "weight": 30.0
        }
        client.post("/pets/", json=pet_data, headers=auth_headers)
        
        # Then get all pets
        response = client.get("/pets/", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == "Max"

    def test_create_pet_unauthorized(self, client):
        """Test creating pet without authentication"""
        pet_data = {
            "name": "Unauthorized Pet",
            "breed": "Test Breed",
            "age": 1,
            "weight": 10.0
        }
        
        response = client.post("/pets/", json=pet_data)
        assert response.status_code == 401

    def test_get_pets_unauthorized(self, client):
        """Test getting pets without authentication"""
        response = client.get("/pets/")
        assert response.status_code == 401