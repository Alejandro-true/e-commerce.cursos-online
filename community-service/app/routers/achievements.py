from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_student_id
from app.database.session import get_db
from app.schemas.reward import StudentAchievementsResponse
from app.services.reward_service import get_student_achievements

router = APIRouter(prefix="/logros", tags=["Logros"])


@router.get(
    "/me",
    response_model=StudentAchievementsResponse,
    responses={
        503: {"description": "Autenticación no disponible"},
    },
)
def get_my_achievements(
    db: Annotated[Session, Depends(get_db)],
    estudiante_id: Annotated[int, Depends(get_current_student_id)],
):
    return get_student_achievements(
        db=db,
        estudiante_id=estudiante_id,
    )