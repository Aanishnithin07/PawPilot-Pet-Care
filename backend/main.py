from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import authentication, pets

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
# This is the part that allows your frontend to talk to your backend
origins = [
    "http://localhost:5173", # The address of your React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# --------------------

# Include the routers in our main app
app.include_router(authentication.router)
app.include_router(pets.router)

@app.get("/")
def read_root():
    return {"Project": "Welcome to the PawPilot API", "status": "healthy"}