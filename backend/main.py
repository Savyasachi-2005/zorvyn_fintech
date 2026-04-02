from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from db.base import Base
from db.session import engine
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router
from routes.records import router as records_router
from routes.users import router as users_router

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://zorvyn-fintech-ptdl.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check() -> dict:
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(records_router, prefix=settings.api_prefix)
app.include_router(users_router, prefix=settings.api_prefix)
app.include_router(dashboard_router, prefix=settings.api_prefix)
