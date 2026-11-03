from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.core.exceptions import (
    ReviewAlreadyHiddenError,
    ReviewNotFoundError,
)
from app.core.security import get_current_admin_id
from app.database.session import get_db
from app.schemas.moderation import (
    ReviewHideRequest,
    ReviewModerationResponse,
)
from app.services.moderation_service import hide_review

router = APIRouter(prefix="/resenas", tags=["Moderación"])


@router.patch(
    "/{resena_id}/ocultar",
    response_model=ReviewModerationResponse,
    responses={
        404: {"description": "Reseña no encontrada"},
        409: {"description": "Reseña ya oculta"},
        503: {"description": "Autenticación no disponible"},
    },
)
def hide_review_endpoint(
    resena_id: Annotated[int, Path(gt=0)],
    data: ReviewHideRequest,
    db: Annotated[Session, Depends(get_db)],
    administrador_id: Annotated[str, Depends(get_current_admin_id)],
):
    try:
        return hide_review(
            db=db,
            resena_id=resena_id,
            data=data,
            administrador_id=administrador_id,
        )
    except ReviewNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc
    except ReviewAlreadyHiddenError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc
