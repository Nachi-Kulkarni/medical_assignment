from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db
from services.summary_service import summary_service

router = APIRouter(prefix="/api/conversations", tags=["summarize"])


class MedicalSummaryResponse(BaseModel):
    """Medical summary response."""
    chief_complaint: str
    symptoms: List[str]
    duration: str
    medications: List[str]
    allergies: List[str]
    follow_up: str


@router.post("/{conversation_id}/summarize", response_model=MedicalSummaryResponse)
async def generate_summary(conversation_id: str, db: Session = Depends(get_db)):
    """Generate a medical summary for a conversation."""
    try:
        summary = await summary_service.generate_summary(db, conversation_id)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
