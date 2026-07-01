from app.core.celery_app import celery_app
from app.services.cloudinary_service import upload_media
from app.services.openai_service import transcribe_audio
from app.core.database import SessionLocal
from app.models.media import Media
import os
import asyncio

def run_async(coro):
    """Helper to run async code inside sync celery tasks."""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task
def process_media_upload(file_path: str, media_type: str, patient_id: int, media_id: int, caption: str = None):
    """
    Background task to process uploaded media.
    """
    secure_url = upload_media(file_path)
    
    transcript = ""
    if media_type in ["voice", "video"]:
        transcript = transcribe_audio(file_path)
        
    db = SessionLocal()
    media_record = db.query(Media).filter(Media.id == media_id).first()
    if media_record:
        media_record.url = secure_url
        media_record.transcript = transcript
        db.commit()
    db.close()
    
    try:
        import cognee
        memory_text = caption or ""
        if transcript:
            memory_text += f"\nTranscript: {transcript}"
            
        run_async(cognee.remember(memory_text))
    except Exception as e:
        print("Cognee remember error:", e)
        
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"media_id": media_id, "url": secure_url}

@celery_app.task
def run_cognee_improve():
    """
    Background task to enrich the Cognee knowledge graph.
    """
    try:
        import cognee
        run_async(cognee.improve())
    except Exception as e:
        print("Cognee improve error:", e)
