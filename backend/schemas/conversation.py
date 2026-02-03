from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
import json

if TYPE_CHECKING:
    from schemas.message import MessageResponse


class Language(str, Enum):
    """Supported languages."""
    EN = "en"
    ES = "es"
    ZH = "zh"
    VI = "vi"
    KO = "ko"
    AR = "ar"
    FR = "fr"


class ConversationStatus(str, Enum):
    """Conversation status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MedicalSummary(BaseModel):
    """AI-generated medical summary."""
    chief_complaint: str = ""
    symptoms: List[str] = []
    duration: str = ""
    medications: List[str] = []
    allergies: List[str] = []
    follow_up: str = ""


class ConversationBase(BaseModel):
    """Base conversation fields."""
    doctor_language: Language = Language.EN
    patient_language: Language = Language.ES


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation."""
    pass


class ConversationUpdate(BaseModel):
    """Schema for updating a conversation."""
    status: Optional[ConversationStatus] = None
    summary: Optional[MedicalSummary] = None


class ConversationResponse(ConversationBase):
    """Schema for conversation response."""
    id: str
    created_at: datetime
    updated_at: datetime
    status: ConversationStatus
    summary: Optional[MedicalSummary] = None
    messages: List["MessageResponse"] = []

    @field_validator('summary', mode='before')
    @classmethod
    def parse_summary(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v

    class Config:
        from_attributes = True


# Forward reference resolution
def update_forward_refs():
    from schemas.message import MessageResponse
    ConversationResponse.model_rebuild()

update_forward_refs()
