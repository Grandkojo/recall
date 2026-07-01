import enum
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    CAREGIVER = "CAREGIVER"
    FAMILY_CONTRIBUTOR = "FAMILY_CONTRIBUTOR"
    PATIENT = "PATIENT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.FAMILY_CONTRIBUTOR, nullable=False)
    
    patient_id = Column(Integer, nullable=True) # Linked patient if applicable
