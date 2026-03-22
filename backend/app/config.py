"""
Configuration management using environment variables
"""
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Mission Panel"
    DEBUG: bool = False

    # Database settings - use absolute path
    DATABASE_URL: str = "sqlite:////home/cwh/coding/mission_panel/data/mission_panel.db"

    # Data directories
    OPENCLAW_DATA_DIR: str = "/home/cwh/.openclaw"
    CODING_DIR: str = "/home/cwh/coding"

    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # File browser settings
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = [
        ".py", ".js", ".ts", ".tsx", ".jsx", ".json",
        ".md", ".txt", ".yaml", ".yml", ".toml",
        ".html", ".css", ".scss", ".sh", ".bash",
        ".sql", ".env.example", ".gitignore"
    ]

    # Sensitive files to filter
    SENSITIVE_PATTERNS: List[str] = [
        ".env", "credentials", "secrets", "password",
        "private_key", "id_rsa", ".pem"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
