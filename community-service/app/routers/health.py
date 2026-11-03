from fastapi import APIRouter

from app.core.config import settings
from app.database.connection import check_connection

router = APIRouter(tags=["Sistema"])


@router.get("/health")
def health():
    return {"status": "ok", "service": "community-service", "authMode": settings.auth_mode}


@router.get("/health/db")
def database_health():
    database_name = check_connection()
    return {"status": "ok", "database": database_name}
