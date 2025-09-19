from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Import our project modules
import schemas
import auth
from database import get_db
import models

router = APIRouter(
    tags=["Authentication"]
)

@router.get("/me", response_model=schemas.User)
async def get_current_user_info(
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get current user information from Firebase token"""
    return current_user

@router.post("/verify")
async def verify_token(
    current_user: models.User = Depends(auth.get_current_user)
):
    """Verify Firebase token and return success"""
    return {"message": "Token is valid", "user_id": current_user.id}