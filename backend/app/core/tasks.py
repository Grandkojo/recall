from app.core.celery_app import celery_app
from app.services.cloudinary_service import upload_media
from app.services.openai_service import transcribe_audio
from app.core.database import SessionLocal
from app.models.media import Media
import os
import asyncio

from starlette.concurrency import run_in_threadpool
import cognee
from app.core.cognee_setup import setup_cognee

setup_cognee()

async def process_media_upload(file_path: str, media_type: str, patient_id: int, media_id: int, caption: str = None):
    """
    Background task to process uploaded media.
    """
    secure_url = await run_in_threadpool(upload_media, file_path)
    
    transcript = ""
    if media_type in ["voice", "video"]:
        transcript = await run_in_threadpool(transcribe_audio, file_path)
        
    db = SessionLocal()
    media_record = db.query(Media).filter(Media.id == media_id).first()
    if media_record:
        media_record.url = secure_url
        media_record.transcript = transcript
        db.commit()
    db.close()
    
    try:
        memory_text = caption or ""
        if transcript:
            memory_text += f"\nTranscript: {transcript}"
            
        await cognee.remember(memory_text)
        
        # Mark as ready
        db = SessionLocal()
        media_record = db.query(Media).filter(Media.id == media_id).first()
        if media_record:
            media_record.status = "ready"
            db.commit()
        db.close()
    except Exception as e:
        print("Cognee remember error:", e)
        db = SessionLocal()
        media_record = db.query(Media).filter(Media.id == media_id).first()
        if media_record:
            media_record.status = "failed"
            db.commit()
        db.close()
        
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"media_id": media_id, "url": secure_url}

async def run_cognee_improve():
    """
    Background task to enrich the Cognee knowledge graph.
    """
    try:
        import cognee
        await cognee.improve()
    except Exception as e:
        print("Cognee improve error:", e)
