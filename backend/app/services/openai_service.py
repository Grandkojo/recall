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

def synthesize_answer(query: str, search_results: list) -> str:
    """
    Takes the raw search results (JSON array of nodes/edges from Cognee)
    and uses the LLM to generate a friendly, natural language answer.
    """
    if not client:
        print("Warning: OpenAI API Key not configured.")
        return "I found some memories, but the AI is not configured to summarize them."
        
    # Convert search results to a string
    import json
    context_str = json.dumps(
        search_results, 
        default=lambda o: o.__dict__ if hasattr(o, '__dict__') else str(o), 
        indent=2
    )
    
    prompt = f"""You are an empathetic, helpful AI assistant for a dementia care app called Recall. 
A caregiver or patient is asking a question about their memories.

Question: {query}

Here is the raw data retrieved from the patient's knowledge graph (JSON format):
{context_str}

Please synthesize this raw data into a natural, conversational, and comforting answer.
If the raw data is empty or does not contain the answer, gently state that you don't have that information in the memory bank yet.
Keep your answer concise and easy to read. Do not output raw JSON.

CRITICAL INSTRUCTION: If any of the raw data chunks contain a tag formatted like "[MEDIA_URL: <url> MEDIA_TYPE: <type>]", you MUST append that EXACT tag to the very end of your final response if you use that information to answer the question. Do not modify the tag.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful and compassionate memory assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating answer: {e}")
        return "I encountered an error trying to process these memories."
