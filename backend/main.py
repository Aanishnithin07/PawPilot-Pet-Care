from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Project": "Welcome to the PawPilot API"}