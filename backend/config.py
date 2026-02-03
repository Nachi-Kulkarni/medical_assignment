from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    openrouter_api_key: str = ""
    database_url: str = "sqlite:///./data/medtranslate.db"
    allowed_origins: str = "http://localhost:5173,https://medtranslate.vercel.app"
    audio_storage_path: str = "./data/audio"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

settings = Settings()
