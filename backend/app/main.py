from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import memories, auth, patients
import cognee
cognee.config.set_embedding_provider("openai")
cognee.config.set_embedding_model("text-embedding-3-small")

from app.core.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Allow the Vite dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
