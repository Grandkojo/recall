from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes an audio or video file using OpenAI's Whisper model.
    """
    if not client:
        print("Warning: OpenAI API Key not configured. Returning mock transcript.")
        return "This is a mock transcript for development."

    try:
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""
