from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid


class Message(Base):
    """Message model for storing individual messages in a conversation."""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    role = Column(String, nullable=False)  # 'doctor' or 'patient'
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)

    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.id} ({self.role})>"
