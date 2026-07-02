from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    diagnosis_stage = Column(String) # E.g., Early, Moderate
    invite_code = Column(String, unique=True, index=True, nullable=True)
    
    media = relationship("Media", back_populates="patient")
