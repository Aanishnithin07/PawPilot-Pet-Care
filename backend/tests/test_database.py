import pytest
from sqlalchemy.orm import Session
from database import get_db, engine
import models

class TestDatabase:
    
    def test_database_connection(self):
        """Test database connection"""
        db_gen = get_db()
        db = next(db_gen)
        assert isinstance(db, Session)
        db.close()

    def test_user_model_creation(self, client):
        """Test User model creation with Firebase UID"""
        db_gen = get_db()
        db = next(db_gen)
        
        user = models.User(
            firebase_uid="test-uid-123",
            email="test@example.com",
            name="Test User"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        assert user.id is not None
        assert user.firebase_uid == "test-uid-123"
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        
        db.close()

    def test_pet_model_creation(self, client):
        """Test Pet model creation"""
        db_gen = get_db()
        db = next(db_gen)
        
        # Create user first
        user = models.User(
            firebase_uid="test-uid-456",
            email="petowner@example.com",
            name="Pet Owner"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create pet
        pet = models.Pet(
            name="Test Pet",
            breed="Test Breed",
            age=2,
            weight=15.0,
            owner_id=user.id
        )
        
        db.add(pet)
        db.commit()
        db.refresh(pet)
        
        assert pet.id is not None
        assert pet.name == "Test Pet"
        assert pet.owner_id == user.id
        
        db.close()

    def test_vaccination_model_creation(self, client):
        """Test Vaccination model creation"""
        from datetime import date
        
        db_gen = get_db()
        db = next(db_gen)
        
        # Create user and pet first
        user = models.User(
            firebase_uid="test-uid-789",
            email="vaccowner@example.com",
            name="Vaccination Owner"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        pet = models.Pet(
            name="Vaccinated Pet",
            breed="Healthy Breed",
            age=1,
            weight=10.0,
            owner_id=user.id
        )
        db.add(pet)
        db.commit()
        db.refresh(pet)
        
        # Create vaccination
        vaccination = models.Vaccination(
            vaccine_name="Rabies",
            date_given=date.today(),
            due_date=date(2026, 1, 19),
            pet_id=pet.id
        )
        
        db.add(vaccination)
        db.commit()
        db.refresh(vaccination)
        
        assert vaccination.id is not None
        assert vaccination.vaccine_name == "Rabies"
        assert vaccination.pet_id == pet.id
        
        db.close()