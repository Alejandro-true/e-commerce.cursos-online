from fastapi import HTTPException
from fastapi import Header

from app.core.config import settings


def get_current_student_id(x_student_id: str | None = Header(default=None)) -> str:
    if settings.auth_mode == "development" and x_student_id and x_student_id.strip():
        return x_student_id.strip()
    raise HTTPException(
        status_code=503,
        detail="Autenticación no disponible. Configura un proveedor de identidad o AUTH_MODE=development solo en local.",
    )

def get_current_admin_id(x_admin_id: str | None = Header(default=None)) -> str:
    if settings.auth_mode == "development" and x_admin_id and x_admin_id.strip():
        return x_admin_id.strip()
    raise HTTPException(
        status_code=503,
        detail="Servicio de autenticación no disponible.",
    )
