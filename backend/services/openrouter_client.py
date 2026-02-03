from dataclasses import dataclass
from enum import Enum
from typing import Optional
import httpx
import asyncio
import logging
from config import settings

logger = logging.getLogger(__name__)


class ModelProvider(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"


@dataclass
class ModelConfig:
    """Configuration for an AI model."""
    id: str
    name: str
    provider: ModelProvider
    max_tokens: int = 4096
    supports_streaming: bool = True


# Available models
MODELS = {
    "flash": ModelConfig(
        id="google/gemini-2.5-flash-lite",
        name="Gemini 2.5 Flash Lite",
        provider=ModelProvider.OPENAI,
        max_tokens=4096,
    ),
    "flash-preview": ModelConfig(
        id="google/gemini-2.5-flash-lite-preview-06-17",
        name="Gemini 2.5 Flash Lite Preview",
        provider=ModelProvider.OPENAI,
        max_tokens=4096,
    ),
}


class OpenRouterError(Exception):
    """Base exception for OpenRouter errors."""
    pass


class RateLimitError(OpenRouterError):
    """Raised when rate limit is exceeded."""
    pass


class AuthenticationError(OpenRouterError):
    """Raised when authentication fails."""
    pass


class OpenRouterClient:
    """Client for OpenRouter API with retry logic."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.max_retries = 3
        self.base_delay = 1.0  # seconds

    def _get_headers(self) -> dict:
        """Get request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://medtranslate.app",
            "X-Title": "MedTranslate",
        }

    async def _make_request(
        self,
        messages: list,
        model: str = "flash",
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """Make request with exponential backoff retry."""
        model_config = MODELS.get(model, MODELS["flash"])

        payload = {
            "model": model_config.id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        last_error = None

        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=self._get_headers(),
                        json=payload,
                    )

                    # Handle auth errors
                    if response.status_code == 401:
                        raise AuthenticationError("Invalid API key")

                    # Handle rate limits
                    if response.status_code == 429:
                        delay = self.base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited, waiting {delay}s")
                        await asyncio.sleep(delay)
                        continue

                    response.raise_for_status()
                    data = response.json()
                    return data["choices"][0]["message"]["content"]

            except httpx.TimeoutException:
                last_error = "Request timeout"
                logger.warning(f"Timeout on attempt {attempt + 1}")
            except httpx.HTTPStatusError as e:
                last_error = f"HTTP error: {e.response.status_code}"
                logger.warning(f"HTTP error on attempt {attempt + 1}: {e.response.status_code}")
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Error on attempt {attempt + 1}: {e}")

        raise OpenRouterError(f"Failed after {self.max_retries} attempts: {last_error}")

    async def chat_completion(
        self,
        messages: list,
        model: str = "flash",
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """Get chat completion from OpenRouter."""
        return await self._make_request(messages, model, temperature, max_tokens)

    async def health_check(self) -> bool:
        """Check if OpenRouter API is accessible."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers=self._get_headers(),
                )
                return response.status_code == 200
        except Exception:
            return False
