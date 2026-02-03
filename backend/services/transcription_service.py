"""Service for transcribing audio using Gemini via OpenRouter."""
import base64
import logging
from pathlib import Path
from typing import Optional
import httpx
from config import settings

logger = logging.getLogger(__name__)


class TranscriptionService:
    """Service for transcribing audio files using Gemini multimodal API."""

    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "google/gemini-2.5-flash"

    def _get_headers(self) -> dict:
        """Get request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://medtranslate.app",
            "X-Title": "MedTranslate",
        }

    async def transcribe_audio(self, audio_path: str) -> Optional[str]:
        """
        Transcribe an audio file using Gemini via OpenRouter.

        Args:
            audio_path: Path to the audio file

        Returns:
            Transcribed text or None if transcription fails
        """
        try:
            # Read and encode audio file
            audio_file = Path(audio_path)
            if not audio_file.exists():
                logger.error(f"Audio file not found: {audio_path}")
                return None

            audio_bytes = audio_file.read_bytes()
            base64_audio = base64.b64encode(audio_bytes).decode("utf-8")

            # Determine format from extension
            format_map = {
                ".webm": "webm",
                ".wav": "wav",
                ".mp3": "mp3",
                ".ogg": "ogg",
                ".m4a": "m4a",
                ".aac": "aac",
                ".flac": "flac",
            }
            ext = audio_file.suffix.lower()
            audio_format = format_map.get(ext, "webm")

            # Build multimodal message
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Transcribe this audio message exactly as spoken. Return only the transcription, no additional text.",
                        },
                        {
                            "type": "input_audio",
                            "input_audio": {
                                "data": base64_audio,
                                "format": audio_format,
                            }
                        }
                    ],
                }
            ]

            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": 1000,
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=payload,
                )

                if response.status_code != 200:
                    logger.error(f"Transcription API error: {response.status_code} - {response.text}")
                    return None

                data = response.json()
                transcription = data["choices"][0]["message"]["content"].strip()
                logger.info(f"Transcription successful: {transcription[:100]}...")
                return transcription

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return None


# Singleton instance
transcription_service = TranscriptionService()
