from fastapi import APIRouter, Depends, HTTPException, status
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

# --- NEW VACCINATION ENDPOINTS ---

@router.post("/{pet_id}/vaccinations/", response_model=schemas.Vaccination)
def create_vaccination_for_pet(pet_id: int, vaccination: schemas.VaccinationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Security check: Ensure the pet belongs to the current user
    db_pet = db.query(models.Pet).filter(models.Pet.id == pet_id, models.Pet.owner_id == current_user.id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return crud.create_vaccination_for_pet(db=db, vaccination=vaccination, pet_id=pet_id)

@router.get("/{pet_id}/vaccinations/", response_model=List[schemas.Vaccination])
def read_vaccinations_for_pet(pet_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Security check
    db_pet = db.query(models.Pet).filter(models.Pet.id == pet_id, models.Pet.owner_id == current_user.id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return crud.get_vaccinations_for_pet(db=db, pet_id=pet_id)