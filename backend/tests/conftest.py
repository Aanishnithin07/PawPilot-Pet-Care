import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from main import app
from database import get_db, Base

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def mock_firebase_user():
    return {
        'uid': 'test-firebase-uid-123',
        'email': 'test@example.com',
        'name': 'Test User',
        'picture': None,
        'email_verified': True
    }

@pytest.fixture
def mock_verify_firebase_token(mock_firebase_user):
    with patch('auth.verify_firebase_token') as mock:
        mock.return_value = mock_firebase_user
        yield mock

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer mock-firebase-token"}