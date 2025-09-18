import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/places",
    tags=["Places"]
)

class LocationRequest(BaseModel):
    lat: float
    lng: float
    search_type: str

@router.post("/nearby")
def find_nearby_places(request: LocationRequest):
    API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

    # --- New Debugging Code ---
    if not API_KEY:
        print("---!!! ERROR: GOOGLE_MAPS_API_KEY NOT FOUND. Check your .env file. !!!---")
        raise HTTPException(status_code=500, detail="Google Maps API key not found on server")

    print(f"--- DEBUG: Attempting to use API Key starting with: {API_KEY[:4]}... ---")
    # -------------------------

    url = "https://places.googleapis.com/v1/places:searchNearby"

    payload = {
        "includedTypes": [request.search_type],
        "maxResultCount": 10,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": request.lat,
                    "longitude": request.lng
                },
                "radius": 5000.0
            }
        }
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location"
    }

    # By removing the 'try...except' block, the full error will now be shown
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status() 
    return response.json()