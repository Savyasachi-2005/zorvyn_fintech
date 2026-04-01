from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from core.config import settings

if not settings.database_url:
    raise RuntimeError("DATABASE_URL environment variable is required")

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
