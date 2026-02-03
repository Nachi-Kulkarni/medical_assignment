from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import logging
from datetime import datetime

from database import get_db
from websocket.manager import manager
from services.translation_service import translation_service
from services.database_service import database_service
from services.transcription_service import transcription_service
from config import settings
import os

logger = logging.getLogger(__name__)

websocket_router = APIRouter()


class JoinMessage(BaseModel):
    """Message for joining a conversation."""
    type: str = "join_conversation"
    conversation_id: str
    role: str  # 'doctor' or 'patient'


class SendMessage(BaseModel):
    """Message for sending to conversation."""
    type: str = "send_message"
    text: str
    role: str  # 'doctor' or 'patient'
    is_audio: Optional[bool] = False
    audio_url: Optional[str] = None  # Path to audio file for transcription


class TypingMessage(BaseModel):
    """Message for typing indicator."""
    type: str = "typing"
    role: str  # 'doctor' or 'patient'
    is_typing: bool


@websocket_router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
    """WebSocket endpoint for real-time messaging."""
    await manager.connect(websocket, conversation_id)

    try:
        while True:
            data = await websocket.receive_text()

            try:
                message = json.loads(data)

                # Handle join_conversation
                if message.get("type") == "join_conversation":
                    role = message.get("role")
                    await websocket.send_json({
                        "type": "joined",
                        "data": {"conversation_id": conversation_id, "role": role}
                    })

                # Handle send_message
                elif message.get("type") == "send_message":
                    await handle_send_message(websocket, conversation_id, message)

                # Handle typing
                elif message.get("type") == "typing":
                    await handle_typing(conversation_id, message)

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
            except Exception as e:
                logger.error(f"Error handling message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def handle_send_message(websocket: WebSocket, conversation_id: str, message_data: dict):
    """Handle sending a message to the conversation."""
    text = message_data.get("text", "")
    role = message_data.get("role", "doctor")
    is_audio = message_data.get("is_audio", False)
    audio_url = message_data.get("audio_url")

    # Determine language pair based on role
    source_lang = "en" if role == "doctor" else "es"
    target_lang = "es" if role == "doctor" else "en"

    # If audio URL is provided, transcribe it
    audio_file_path = None
    if audio_url:
        # Extract audio ID from URL (e.g., "/api/audio/abc123" -> "abc123")
        audio_id = audio_url.split("/")[-1]
        audio_file_path = os.path.join(settings.audio_storage_path, f"{audio_id}.webm")

        # Transcribe the audio
        logger.info(f"Transcribing audio: {audio_file_path}")
        transcription = await transcription_service.transcribe_audio(audio_file_path)

        if transcription:
            text = transcription
            logger.info(f"Audio transcribed: {text[:100]}...")
        else:
            # Fallback if transcription fails
            text = text or "[Transcription failed]"
            logger.warning("Audio transcription failed, using fallback text")

    # If text is still empty after transcription attempt, use placeholder
    if not text or not text.strip():
        text = "[Empty message]"

    # Translate the message
    try:
        translation = await translation_service.translate(text, source_lang, target_lang)
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        translation = {
            "original_text": text,
            "translated_text": text,
            "source_language": source_lang,
            "target_language": target_lang,
        }

    # Save to database
    db = next(get_db())
    try:
        message_obj = await database_service.create_message(
            db=db,
            conversation_id=conversation_id,
            role=role,
            original_text=translation["original_text"],
            translated_text=translation["translated_text"],
            audio_url=audio_url,
        )
        logger.info(f"Message saved to database: {message_obj['id']}")
    except Exception as e:
        logger.error(f"Failed to save message to database: {e}")
        # Create a fallback message object even if DB save fails
        message_obj = {
            "id": f"msg-{conversation_id}-{len(text)}",
            "conversation_id": conversation_id,
            "role": role,
            "original_text": translation["original_text"],
            "translated_text": translation["translated_text"],
            "audio_url": audio_url,
            "created_at": datetime.utcnow().isoformat(),
        }
    finally:
        db.close()

    # Broadcast to all participants
    await manager.broadcast(conversation_id, {
        "type": "new_message",
        "data": message_obj
    })


async def handle_typing(conversation_id: str, message_data: dict):
    """Handle typing indicator."""
    role = message_data.get("role", "doctor")
    is_typing = message_data.get("is_typing", False)

    await manager.broadcast(conversation_id, {
        "type": "typing",
        "data": {"role": role, "is_typing": is_typing}
    })
