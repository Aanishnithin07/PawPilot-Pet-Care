from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import initialize_firebase
# Make sure 'places' is imported here
from routers import authentication, pets, diagnosis, vaccinations, places

# Initialize Firebase on startup
initialize_firebase()

# This creates the main app instance
app = FastAPI()

# --- This is the correct place for the CORS Middleware ---
# It must be added before the routers are included.
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------------------

# --- Include all your routers here, only once ---
app.include_router(authentication.router)
app.include_router(pets.router)
app.include_router(diagnosis.router)
app.include_router(vaccinations.router)
app.include_router(places.router) # This was the missing line

# --- Your root endpoint ---
@app.get("/")
def read_root():
    return {"Project": "Welcome to the PawPilot API", "status": "healthy"}