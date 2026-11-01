from fastapi import HTTPException


def get_current_student_id() -> int:
    raise HTTPException(
        status_code=503,
        detail="Servicio de autenticación no disponible.",
    )

def get_current_admin_id() -> int:
    raise HTTPException(
        status_code=503,
        detail="Servicio de autenticación no disponible.",
    )