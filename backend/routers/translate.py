from fastapi import APIRouter
from pydantic import BaseModel
from services.translation_service import translation_service

router = APIRouter(prefix="/api/translate", tags=["translate"])


class TranslateRequest(BaseModel):
    """Request for translation."""
    text: str
    source_language: str  # en, es, zh, vi, ko, ar, fr
    target_language: str


class TranslateResponse(BaseModel):
    """Response from translation."""
    original_text: str
    translated_text: str
    source_language: str
    target_language: str


@router.post("/", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    """Translate text from source language to target language."""
    result = await translation_service.translate(
        text=request.text,
        source_language=request.source_language,
        target_language=request.target_language,
    )
    return result
