from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    
    media_type = Column(String) # photo, voice, video
    url = Column(String, nullable=False)
    caption = Column(Text)
    transcript = Column(Text) # for voice/video
    status = Column(String, default="processing")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="media")
