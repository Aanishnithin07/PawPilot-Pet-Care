from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    # Keep hashed_password for migration period, will be removed later
    hashed_password = Column(String, nullable=True)

    pets = relationship("Pet", back_populates="owner")

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    breed = Column(String)
    age = Column(Integer)
    weight = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="pets")
    vaccinations = relationship("Vaccination", back_populates="pet")

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    vaccine_name = Column(String, index=True)
    date_given = Column(Date)
    due_date = Column(Date)
    pet_id = Column(Integer, ForeignKey("pets.id"))
    
    pet = relationship("Pet", back_populates="vaccinations")