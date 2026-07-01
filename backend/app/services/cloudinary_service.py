import cloudinary
import cloudinary.uploader
from app.core.config import settings

if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET
    )

def upload_media(file_path: str, folder: str = "recall_media") -> str:
    """
    Uploads a local file to Cloudinary and returns the secure URL.
    Works for photos, audio, and video files.
    """
    if not settings.CLOUDINARY_CLOUD_NAME:
        print("Warning: Cloudinary not configured. Returning local mock URL.")
        return f"mock_url_for_{file_path}"

    response = cloudinary.uploader.upload(
        file_path, 
        folder=folder, 
        resource_type="auto"
    )
    return response.get("secure_url")
