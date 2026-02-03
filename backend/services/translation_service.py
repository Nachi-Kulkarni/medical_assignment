from services.openrouter_client import OpenRouterClient
from prompts.translation import get_translation_prompt
import logging

logger = logging.getLogger(__name__)


class TranslationService:
    """Service for translating text between languages."""

    def __init__(self):
        self.client = OpenRouterClient()

    async def translate(
        self,
        text: str,
        source_language: str,
        target_language: str,
    ) -> dict:
        """
        Translate text from source language to target language.

        Args:
            text: Text to translate
            source_language: Source language code (en, es, etc.)
            target_language: Target language code (en, es, etc.)

        Returns:
            Dict with original_text, translated_text, source_language, target_language
        """
        if not text or not text.strip():
            return {
                "original_text": text,
                "translated_text": "",
                "source_language": source_language,
                "target_language": target_language,
            }

        # Same language - return as-is
        if source_language == target_language:
            return {
                "original_text": text,
                "translated_text": text,
                "source_language": source_language,
                "target_language": target_language,
            }

        try:
            messages = get_translation_prompt(source_language, target_language, text)
            translated = await self.client.chat_completion(
                messages=messages,
                model="flash",
                temperature=0.3,  # Lower temp for more consistent translations
            )

            return {
                "original_text": text,
                "translated_text": translated.strip(),
                "source_language": source_language,
                "target_language": target_language,
            }

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            # Return original text as fallback
            return {
                "original_text": text,
                "translated_text": text,
                "source_language": source_language,
                "target_language": target_language,
            }


# Singleton instance
translation_service = TranslationService()
