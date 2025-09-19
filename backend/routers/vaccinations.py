from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/vaccinations",
    tags=["Vaccinations"]
)

@router.get("/upcoming", response_model=List[schemas.Vaccination])
def get_upcoming_vaccinations(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Gets all upcoming vaccination records for all pets belonging to the current user.
    """
    today = date.today()
    upcoming_vaccinations = (
        db.query(models.Vaccination)
        .join(models.Pet)
        .filter(models.Pet.owner_id == current_user.id)
        .filter(models.Vaccination.due_date >= today)
        .order_by(models.Vaccination.due_date.asc())
        .limit(5)
        .all()
    )
    return upcoming_vaccinations