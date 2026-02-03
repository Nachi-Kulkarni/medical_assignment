from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.conversation import Conversation
from models.message import Message
from schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=MessageResponse)
async def create_message(data: MessageCreate, db: Session = Depends(get_db)):
    """Create a new message."""
    # Verify conversation exists
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == data.conversation_id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    message = Message(
        conversation_id=data.conversation_id,
        role=data.role,
        original_text=data.original_text,
        translated_text=data.translated_text,
        audio_url=data.audio_url,
    )
    db.add(message)

    # Update conversation timestamp
    conversation.updated_at = message.created_at

    db.commit()
    db.refresh(message)
    return message


@router.get("/{conversation_id}", response_model=List[MessageResponse])
async def list_messages(conversation_id: str, db: Session = Depends(get_db)):
    """Get all messages for a conversation."""
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages
