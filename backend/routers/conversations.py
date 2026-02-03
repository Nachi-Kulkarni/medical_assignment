from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db, init_db
from models.conversation import Conversation
from models.message import Message
from schemas.conversation import ConversationCreate, ConversationResponse, ConversationUpdate

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("/", response_model=ConversationResponse)
async def create_conversation(data: ConversationCreate, db: Session = Depends(get_db)):
    """Create a new conversation."""
    # Ensure tables exist
    init_db()

    conversation = Conversation(
        doctor_language=data.doctor_language.value,
        patient_language=data.patient_language.value,
        status="active",
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List all conversations."""
    conversations = (
        db.query(Conversation)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return conversations


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Get a conversation by ID with its messages."""
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    updates: ConversationUpdate,
    db: Session = Depends(get_db),
):
    """Update a conversation."""
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if updates.status is not None:
        conversation.status = updates.status.value
    if updates.summary is not None:
        conversation.summary = updates.summary.model_dump_json()

    db.commit()
    db.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation."""
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted"}
