from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_role, get_current_user
from app.core.tasks import process_media_upload, run_cognee_improve
from app.models.media import Media
from app.models.patient import Patient
import shutil
import os
import cognee

router = APIRouter(prefix="/api/memories", tags=["Memories"])

os.makedirs("temp_uploads", exist_ok=True)

@router.post("/")
async def add_memory(
    patient_id: int = Form(...),
    media_type: str = Form(...), # photo, voice, video, text
    caption: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: dict = Depends(require_role(["CAREGIVER", "FAMILY_CONTRIBUTOR"]))
):
    """
    Upload a memory for a patient.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    db_media = Media(
        patient_id=patient_id,
        uploaded_by=user.id,
        media_type=media_type,
        caption=caption,
        url="processing..." if file else "text-only"
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    
    if file:
        temp_path = f"temp_uploads/{db_media.id}_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        process_media_upload.delay(temp_path, media_type, patient_id, db_media.id, caption)
    else:
        # text only memory, run asynchronously
        import asyncio
        asyncio.create_task(cognee.remember(caption or ""))

    return {"message": "Memory upload initiated", "media_id": db_media.id}

@router.get("/query")
async def query_memories(
    q: str, 
    patient_id: int,
    user: dict = Depends(get_current_user)
):
    """
    Search/Reminisce interface for patients and caregivers.
    """
    results = await cognee.recall(q)
    return {"query": q, "results": results}

@router.get("/patient/{patient_id}")
async def get_patient_memories(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Fetch all raw memory records for a given patient to allow caregivers to manage them.
    """
    memories = db.query(Media).filter(Media.patient_id == patient_id).order_by(Media.created_at.desc()).all()
    return memories

@router.post("/enrich")
async def enrich_graph(
    user: dict = Depends(require_role(["CAREGIVER"]))
):
    """
    Trigger a background graph enrichment job.
    """
    run_cognee_improve.delay()
    return {"message": "Graph enrichment task started"}

@router.delete("/{media_id}")
async def delete_memory(
    media_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_role(["CAREGIVER"]))
):
    """
    Surgically remove a memory.
    """
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    db.delete(media)
    db.commit()
    
    # We don't have media_id direct mapping in cognee without metadata tracking
    # For now, it's a stub or we'd delete the specific node
    
    return {"message": "Memory deleted successfully"}
