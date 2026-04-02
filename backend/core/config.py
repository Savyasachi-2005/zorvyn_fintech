import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Finance API")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    api_prefix: str = os.getenv("API_PREFIX", "")
    database_url: str = os.getenv("DATABASE_URL", "")
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "change_me")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    @property
    def get_db_url(self) -> str:
        if self.database_url and self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql://", 1)
        return self.database_url

settings = Settings()
