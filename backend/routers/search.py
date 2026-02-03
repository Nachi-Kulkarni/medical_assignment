from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.message import Message
from pydantic import BaseModel

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchResult(BaseModel):
    """Search result with highlighted text."""
    message_id: str
    conversation_id: str
    snippet: str
    highlighted_text: str
    role: str
    created_at: str


@router.get("/", response_model=List[SearchResult])
async def search_messages(q: str, db: Session = Depends(get_db)):
    """Search across all message texts."""
    if not q or len(q.strip()) < 2:
        return []

    query_lower = q.lower()

    # Search in both original and translated text
    messages = (
        db.query(Message)
        .filter(
            (Message.original_text.ilike(f"%{q}%")) |
            (Message.translated_text.ilike(f"%{q}%"))
        )
        .order_by(Message.created_at.desc())
        .limit(50)
        .all()
    )

    results = []
    for msg in messages:
        # Find matching text
        text = msg.original_text
        if query_lower in text.lower():
            match_text = text
        else:
            match_text = msg.translated_text

        # Create snippet (context around match)
        words = match_text.split()
        snippet_words = []
        for i, word in enumerate(words):
            if q.lower() in word.lower():
                start = max(0, i - 3)
                end = min(len(words), i + 4)
                snippet_words = words[start:end]
                break

        snippet = "..." + " ".join(snippet_words) + "..."

        # Highlight matches
        highlighted = match_text.replace(
            q, f"<mark>{q}</mark>"
        ).replace(
            q.capitalize(), f"<mark>{q.capitalize()}</mark>"
        ).replace(
            q.lower(), f"<mark>{q.lower()}</mark>"
        ).replace(
            q.upper(), f"<mark>{q.upper()}</mark>"
        )

        results.append(SearchResult(
            message_id=msg.id,
            conversation_id=msg.conversation_id,
            snippet=snippet,
            highlighted_text=highlighted,
            role=msg.role,
            created_at=msg.created_at.isoformat(),
        ))

    return results
