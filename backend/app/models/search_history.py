from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    query = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
