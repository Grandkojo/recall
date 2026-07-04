from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
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
    background_tasks: BackgroundTasks,
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
    if file:
        max_size = 0
        if media_type == 'photo': max_size = 5 * 1024 * 1024
        elif media_type == 'voice': max_size = 10 * 1024 * 1024
        elif media_type == 'video': max_size = 50 * 1024 * 1024
        
        if max_size > 0 and file.size and file.size > max_size:
            raise HTTPException(status_code=400, detail=f"File too large for {media_type}")
            
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
            
        background_tasks.add_task(process_media_upload, temp_path, media_type, patient_id, db_media.id, caption)
    else:
        # text only memory, run asynchronously
        async def process_text_memory(text: str, m_id: int):
            from app.core.database import SessionLocal
            try:
                await cognee.remember(text)
                
                db_session = SessionLocal()
                media_record = db_session.query(Media).filter(Media.id == m_id).first()
                if media_record:
                    media_record.status = "ready"
                    db_session.commit()
                db_session.close()
            except Exception as e:
                print("Cognee remember error:", e)
                db_session = SessionLocal()
                media_record = db_session.query(Media).filter(Media.id == m_id).first()
                if media_record:
                    media_record.status = "failed"
                    db_session.commit()
                db_session.close()

        background_tasks.add_task(process_text_memory, caption or "", db_media.id)

    return {"message": "Memory upload initiated", "media_id": db_media.id}

@router.get("/query")
async def query_memories(
    q: str, 
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Search/Reminisce interface for patients and caregivers.
    """
    # Save search history
    from app.models.search_history import SearchHistory
    latest = db.query(SearchHistory).filter(SearchHistory.patient_id == patient_id).order_by(SearchHistory.created_at.desc()).first()
    if not latest or latest.query != q:
        history = SearchHistory(patient_id=patient_id, query=q)
        db.add(history)
        db.commit()

    from cognee.api.v1.search import SearchType
    results = await cognee.search(q, query_type=SearchType.CHUNKS)
    
    from app.services.openai_service import synthesize_answer
    friendly_answer = synthesize_answer(q, results)
    
    return {"query": q, "results": results, "answer": friendly_answer}

@router.get("/history/{patient_id}")
async def get_query_history(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Get recent unique queries for the patient.
    """
    from app.models.search_history import SearchHistory
    history = db.query(SearchHistory).filter(SearchHistory.patient_id == patient_id).order_by(SearchHistory.created_at.desc()).limit(20).all()
    
    seen = set()
    unique_queries = []
    for h in history:
        if h.query not in seen:
            unique_queries.append(h.query)
            seen.add(h.query)
        if len(unique_queries) >= 10:
            break
            
    return unique_queries

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
    background_tasks: BackgroundTasks,
    user: dict = Depends(require_role(["CAREGIVER"]))
):
    """
    Trigger a background graph enrichment job.
    """
    background_tasks.add_task(run_cognee_improve)
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
