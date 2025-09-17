from pydantic import BaseModel
from datetime import date
from typing import List, Optional

# --- Vaccination Schemas ---
class VaccinationBase(BaseModel):
    vaccine_name: str
    date_given: date
    due_date: date

class VaccinationCreate(VaccinationBase):
    pass

class Vaccination(VaccinationBase):
    id: int
    pet_id: int

    class Config:
        from_attributes = True

# --- Pet Schemas ---
class PetBase(BaseModel):
    name: str
    breed: str
    age: int
    weight: float

class PetCreate(PetBase):
    pass

class Pet(PetBase):
    id: int
    owner_id: int
    vaccinations: List[Vaccination] = []

    class Config:
        orm_mode = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    # This allows us to see the user's pets when we fetch a user
    pets: List[Pet] = [] 

    class Config:
        orm_mode = True

# Add this to the end of schemas.py
class TokenData(BaseModel):
    id: Optional[str] = None