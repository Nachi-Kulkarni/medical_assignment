import json
from typing import List
from sqlalchemy.orm import Session
from services.openrouter_client import OpenRouterClient
from prompts.summary import get_summary_prompt
from models.conversation import Conversation
from models.message import Message
import logging

logger = logging.getLogger(__name__)


class SummaryService:
    """Service for generating medical summaries from conversations."""

    def __init__(self):
        self.client = OpenRouterClient()

    def _build_conversation_text(self, messages: List[Message]) -> str:
        """Build conversation text from messages."""
        lines = []
        for msg in messages:
            role = "Doctor" if msg.role == "doctor" else "Patient"
            lines.append(f"{role}: {msg.original_text}")
        return "\n".join(lines)

    def _extract_json(self, response: str) -> str:
        """Extract JSON from response, handling markdown code blocks."""
        response = response.strip()
        # Remove markdown code block if present
        if response.startswith("```"):
            # Find the end of the opening fence
            first_newline = response.find("\n")
            if first_newline != -1:
                response = response[first_newline:]
            # Remove closing fence
            if response.endswith("```"):
                response = response[:-3]
        return response.strip()

    async def generate_summary(
        self,
        db: Session,
        conversation_id: str,
    ) -> dict:
        """
        Generate a medical summary from a conversation.

        Args:
            db: Database session
            conversation_id: Conversation ID

        Returns:
            Dict with medical summary fields
        """
        # Fetch conversation and messages
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

        if not conversation:
            raise ValueError("Conversation not found")

        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        if not messages:
            # Return empty summary
            return {
                "chief_complaint": "No conversation yet",
                "symptoms": [],
                "duration": "Not discussed",
                "medications": [],
                "allergies": [],
                "follow_up": "Not discussed",
            }

        try:
            # Build conversation text
            conversation_text = self._build_conversation_text(messages)

            # Get summary from AI
            messages_prompt = get_summary_prompt(conversation_text)
            response = await self.client.chat_completion(
                messages=messages_prompt,
                model="flash",
                temperature=0.5,
                max_tokens=1000,
            )

            # Parse JSON response (handle markdown code blocks)
            json_text = self._extract_json(response)
            summary_data = json.loads(json_text)

            # Update conversation with summary
            conversation.summary = json.dumps(summary_data)
            db.commit()

            return summary_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse summary JSON: {e}")
            # Return empty summary on error
            return {
                "chief_complaint": "Summary generation failed",
                "symptoms": [],
                "duration": "Not discussed",
                "medications": [],
                "allergies": [],
                "follow_up": "Not discussed",
            }
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            raise


# Singleton instance
summary_service = SummaryService()
