from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import authentication, pets, diagnosis, places # Import the new places router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ... (your CORS middleware should be here)

# Include the routers
app.include_router(authentication.router)
app.include_router(pets.router)
app.include_router(diagnosis.router)
app.include_router(places.router) # Add this line

# ... (your @app.get("/") should be here)
# --- CORS Middleware ---
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
# --------------------

# Include the routers
app.include_router(authentication.router)
app.include_router(pets.router)
app.include_router(diagnosis.router)

@app.get("/")
def read_root():
    return {"Project": "Welcome to the PawPilot API", "status": "healthy"}