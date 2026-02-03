from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid

# Import models
from models.conversation import Conversation
from models.message import Message


class DatabaseService:
    """Service for database operations."""

    async def create_conversation(
        self,
        db: Session,
        doctor_language: str = "en",
        patient_language: str = "es",
    ) -> dict:
        """Create a new conversation."""
        conversation = Conversation(
            doctor_language=doctor_language,
            patient_language=patient_language,
            status="active",
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return self._conversation_to_dict(conversation)

    async def get_conversation(
        self,
        db: Session,
        conversation_id: str,
    ) -> Optional[dict]:
        """Get a conversation by ID."""
        result = db.execute(select(Conversation).where(Conversation.id == conversation_id))
        conversation = result.scalar_one_or_none()
        if conversation:
            return self._conversation_to_dict(conversation)
        return None

    async def list_conversations(
        self,
        db: Session,
        limit: int = 50,
        offset: int = 0,
    ) -> List[dict]:
        """List all conversations."""
        result = db.execute(
            select(Conversation)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        conversations = result.scalars().all()
        return [self._conversation_to_dict(c) for c in conversations]

    async def create_message(
        self,
        db: Session,
        conversation_id: str,
        role: str,
        original_text: str,
        translated_text: str,
        audio_url: Optional[str] = None,
    ) -> dict:
        """Create a new message."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            original_text=original_text,
            translated_text=translated_text,
            audio_url=audio_url,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return self._message_to_dict(message)

    async def get_messages(
        self,
        db: Session,
        conversation_id: str,
    ) -> List[dict]:
        """Get all messages for a conversation."""
        result = db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()
        return [self._message_to_dict(m) for m in messages]

    def _conversation_to_dict(self, conversation: Conversation) -> dict:
        """Convert conversation model to dict."""
        return {
            "id": conversation.id,
            "doctor_language": conversation.doctor_language,
            "patient_language": conversation.patient_language,
            "status": conversation.status,
            "summary": conversation.summary,
            "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
            "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None,
        }

    def _message_to_dict(self, message: Message) -> dict:
        """Convert message model to dict."""
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "role": message.role,
            "original_text": message.original_text,
            "translated_text": message.translated_text,
            "audio_url": message.audio_url,
            "created_at": message.created_at.isoformat() if message.created_at else None,
        }


# Singleton instance
database_service = DatabaseService()
