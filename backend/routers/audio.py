from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from datetime import datetime
from database import get_db
from config import settings

router = APIRouter(prefix="/api/audio", tags=["audio"])

# Ensure audio directory exists
os.makedirs(settings.audio_storage_path, exist_ok=True)

ALLOWED_EXTENSIONS = {"webm", "wav", "mp3", "ogg", "m4a"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file and return its ID."""
    # Validate file extension
    ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate unique ID
    audio_id = str(uuid.uuid4())
    filename = f"{audio_id}.{ext}"
    filepath = os.path.join(settings.audio_storage_path, filename)

    # Save file with size validation
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file.file.seek(0, os.SEEK_END)
            size = file.file.tell()
            if size > MAX_FILE_SIZE:
                os.remove(filepath)
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB"
                )
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return {
        "id": audio_id,
        "filename": filename,
        "url": f"/api/audio/{audio_id}"
    }


@router.get("/{audio_id}")
async def get_audio(audio_id: str):
    """Stream an audio file by ID."""
    # Find the file
    for ext in ALLOWED_EXTENSIONS:
        filepath = os.path.join(settings.audio_storage_path, f"{audio_id}.{ext}")
        if os.path.exists(filepath):
            # Determine media type
            media_types = {
                "webm": "audio/webm",
                "wav": "audio/wav",
                "mp3": "audio/mpeg",
                "ogg": "audio/ogg",
                "m4a": "audio/mp4",
            }
            media_type = media_types.get(ext, "audio/webm")

            return FileResponse(
                filepath,
                media_type=media_type,
                filename=f"{audio_id}.{ext}"
            )

    raise HTTPException(status_code=404, detail="Audio file not found")
