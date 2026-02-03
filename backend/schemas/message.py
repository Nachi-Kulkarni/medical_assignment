from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from schemas.conversation import ConversationStatus


class MessageBase(BaseModel):
    """Base message fields."""
    original_text: str
    translated_text: str
    role: str  # 'doctor' or 'patient'


class MessageCreate(MessageBase):
    """Schema for creating a message."""
    conversation_id: str
    audio_url: Optional[str] = None


class MessageResponse(MessageBase):
    """Schema for message response."""
    id: str
    conversation_id: str
    created_at: datetime
    audio_url: Optional[str] = None

    class Config:
        from_attributes = True
