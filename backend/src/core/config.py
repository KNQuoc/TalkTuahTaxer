from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings and configuration"""
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TalkTuahTaxer"
    OPENAI_API_KEY: str
    ELEVENLABS_API_KEY: str
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    """Get cached settings"""
    return Settings()