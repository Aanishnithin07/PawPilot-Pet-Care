from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas, models, crud, auth
from database import get_db

router = APIRouter(
    prefix="/pets",
    tags=["Pets"]
)

@router.post("/", response_model=schemas.Pet)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_pet_for_user(db=db, pet=pet, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Pet])
def read_pets(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    pets = crud.get_pets_by_user(db, user_id=current_user.id)
    return pets