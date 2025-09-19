from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
import schemas

# Setup for secure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()

def create_user_from_firebase(db: Session, firebase_uid: str, email: str, name: str = None):
    """Create user from Firebase authentication info"""
    db_user = models.User(
        firebase_uid=firebase_uid,
        email=email,
        name=name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_pets_by_user(db: Session, user_id: int):
    return db.query(models.Pet).filter(models.Pet.owner_id == user_id).all()

def create_pet_for_user(db: Session, pet: schemas.PetCreate, user_id: int):
    db_pet = models.Pet(**pet.model_dump(), owner_id=user_id)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet
# Add these two functions to the end of crud.py

def create_vaccination_for_pet(db: Session, vaccination: schemas.VaccinationCreate, pet_id: int):
    db_vaccination = models.Vaccination(**vaccination.model_dump(), pet_id=pet_id)
    db.add(db_vaccination)
    db.commit()
    db.refresh(db_vaccination)
    return db_vaccination

def get_vaccinations_for_pet(db: Session, pet_id: int):
    return db.query(models.Vaccination).filter(models.Vaccination.pet_id == pet_id).all()