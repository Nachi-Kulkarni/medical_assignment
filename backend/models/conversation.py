from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Conversation(Base):
    """Conversation model for storing doctor-patient conversations."""
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    doctor_language = Column(String, default="en", nullable=False)
    patient_language = Column(String, default="es", nullable=False)
    status = Column(String, default="active", nullable=False)  # active, completed, archived
    summary = Column(Text, nullable=True)

    # Relationship to messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation {self.id} ({self.doctor_language} → {self.patient_language})>"
