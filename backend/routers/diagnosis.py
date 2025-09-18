import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from services import image_analysis_service # Import our new service

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
            "You are a helpful veterinary assistant providing preliminary triage advice. "
            "You are not a doctor and must not give a diagnosis. "
            "A pet owner describes the following symptoms: '{}'. "
            "Based on these symptoms, what are three likely, non-emergency conditions? "
            "For each, provide a brief, friendly explanation and strongly advise the user to consult a professional vet for a real diagnosis. "
            "Format your response in simple markdown."
        ).format(request.symptoms)

        response = model.generate_content(prompt)
        return {"diagnosis": response.text}
    except Exception as e:
        print(f"---!!! AN EXCEPTION OCCURRED IN GEMINI CALL !!!---")
        print(f"THE REAL ERROR IS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW IMAGE ANALYSIS ENDPOINT ---
@router.post("/image")
async def get_image_analysis(file: UploadFile = File(...)):
    try:
        # Read the image file content
        image_bytes = await file.read()
        # Call our analysis service
        result = image_analysis_service.analyze_image(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {e}")