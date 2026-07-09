from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import memories, auth, patients
from app.core.cognee_setup import setup_cognee
setup_cognee()
from app.core.database import engine
from app.models import Base
from dotenv import load_dotenv
import os
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Allow the Vite dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        os.getenv("FRONTEND_URL1"),
        os.getenv("FRONTEND_URL2"),
        os.getenv("FRONTEND_URL3"),
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(memories.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Recall Backend API"}
