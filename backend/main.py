from fastapi import FastAPI
import models
from database import engine
from routers import authentication, pets # Import the new pets router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include the routers in our main app
app.include_router(authentication.router)
app.include_router(pets.router) # Add this line

@app.get("/")
def read_root():
    return {"Project": "Welcome to the PawPilot API", "status": "healthy"}