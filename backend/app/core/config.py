from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recall Backend"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/recall"
    REDIS_URL: str = "redis://redis:6379/0"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
