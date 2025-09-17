import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()

router = APIRouter(
    prefix="/diagnose",
    tags=["Diagnosis"]
)

class SymptomRequest(BaseModel):
    symptoms: str

@router.post("/text")
def get_text_diagnosis(request: SymptomRequest):
    print("--- CHECKPOINT 1: AI DIAGNOSIS ENDPOINT HIT ---")
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"--- CHECKPOINT 2: Found API Key: {'Yes' if api_key else 'No. Check your .env file.'} ---")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found or is empty in your .env file")

        genai.configure(api_key=api_key)
        print("--- CHECKPOINT 3: Gemini configured successfully. ---")

        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        print("--- CHECKPOINT 4: Model loaded successfully. ---")

        prompt = (
            "You are a helpful veterinary assistant providing preliminary triage advice. " "You are not a doctor and must not give a diagnosis. " "you can act as a vet assistant. also as a doctor you can provide diagnosis upto a level but mostly you would be advising to consult a vet if things go really bad. " "remember the pet parents would be in a confused state when their pets facing some health issues and they would be looking for some reassurance and guidance. so be empathetic and gentle in your tone. " "A pet owner describes the following symptoms: '{}'. " "also emotionally support the pet owner and tell them that you understand how worrying it can be when a pet is unwell. " "you will be mostly handling with dogs and breeds so rapidly get data and provide possible answers" "Based on these symptoms, what are three likely, non-emergency conditions? " "For each, provide a brief, friendly explanation and strongly advise the user to consult a professional vet for a real diagnosis. " "Format your response in simple markdown."
        ).format(request.symptoms)

        print("--- CHECKPOINT 5: Generating content from Gemini... ---")
        response = model.generate_content(prompt)
        print("--- CHECKPOINT 6: Content generated successfully. ---")

        return {"diagnosis": response.text}
    except Exception as e:
        # This will force the real error to be printed in your terminal
        print(f"---!!! AN EXCEPTION OCCURRED BETWEEN CHECKPOINTS !!!---")
        print(f"THE REAL ERROR IS: {e}")
        raise HTTPException(status_code=500, detail=str(e))