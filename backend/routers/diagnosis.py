import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(
    prefix="/diagnose",
    tags=["Diagnosis"]
)

class SymptomRequest(BaseModel):
    symptoms: str

@router.post("/text")
def get_text_diagnosis(request: SymptomRequest):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = (
            "You are a helpful veterinarian  providing preliminary triage advice. "
            "You are not a doctor and must not give a diagnosis. "
            "A pet owner describes the following symptoms: '{}'. "
            "Based on these symptoms, what are three likely, non-emergency conditions? "
            "For each, provide a brief, friendly explanation and strongly advise the user to consult a professional vet for a real diagnosis. "
            "Format your response in simple markdown."
        ).format(request.symptoms)

        response = model.generate_content(prompt)
        return {"diagnosis": response.text}
    except Exception as e:
        print(f"THE REAL ERROR IS (Text Diagnosis): {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW BREED / PET IDENTIFIER ENDPOINT ---
@router.post("/breed-image")
async def get_breed_analysis(file: UploadFile = File(...)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))

        prompt_parts = [
            "Identify the breed of the pet in this image. If it's a mix, guess the dominant breed. "
            "Also, describe the type of animal (e.g., 'dog', 'cat', 'rabbit'). "
            "Be concise and focus only on identification. Format: 'Type: [animal_type], Breed: [breed_name]'. "
            "If no pet is clearly visible or identifiable, state 'No identifiable pet'.",
            img,
        ]

        response = model.generate_content(prompt_parts)
        return {"identification": response.text}

    except Exception as e:
        print(f"THE REAL ERROR IS (Breed Image Analysis): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image for breed: {e}")

# --- UPDATED INJURY / CONDITION ANALYSIS ENDPOINT ---
@router.post("/injury-image") # Renamed from /image to /injury-image
async def get_injury_analysis(file: UploadFile = File(...)):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))

        prompt_parts = [
            "You are a helpful veterinarian with a handfull years of experience . Analyze this image of a pet's potential injury or skin condition. "
            "Describe objectively what you see (e.g., 'red inflamed patch', 'open wound', 'swelling'). "
            "Suggest 2-3 general *non-emergency* possibilities for what it *could* be, or 2-3 general factors that *could* cause it (e.g., 'allergic reaction', 'insect bite', 'minor abrasion'). "
            "Do NOT give a specific medical diagnosis but just give a general one. "
            "Do NOT identify the breed of the animal. Focus solely on the observed condition. "
            "Conclude by strongly and clearly advising the user to consult a professional veterinarian immediately for a proper diagnosis and treatment but try to explain them properly what is the condition . "
            "Format your response in simple, clear language.",
            img,
        ]

        response = model.generate_content(prompt_parts)
        return {"analysis": response.text}

    except Exception as e:
        print(f"THE REAL ERROR IS (Injury Image Analysis): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image for injury: {e}")