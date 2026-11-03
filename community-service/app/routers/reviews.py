from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.clients.catalog import CatalogClient, get_catalog_client
from app.core.exceptions import (
    CourseAccessDeniedError,
    IntegrationUnavailableError,
)
from app.core.security import get_current_student_id
from app.database.session import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import create_review, list_reviews

router = APIRouter(prefix="/resenas", tags=["Reseñas"])


@router.get("", response_model=list[ReviewResponse])
def get_reviews(
    curso_id: Annotated[str, Query(min_length=1, max_length=36)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return list_reviews(
        db=db,
        curso_id=curso_id,
        limit=limit,
        offset=offset,
    )

@router.post(
    "",
    response_model=ReviewResponse,
    status_code=201,
)
def post_review(
    data: ReviewCreate,
    db: Annotated[Session, Depends(get_db)],
    estudiante_id: Annotated[str, Depends(get_current_student_id)],
    catalog_client: Annotated[CatalogClient, Depends(get_catalog_client)],
):
    try:
        return create_review(
            db=db,
            data=data,
            estudiante_id=estudiante_id,
            catalog_client=catalog_client,
        )
    except CourseAccessDeniedError as exc:
        raise HTTPException(
            status_code=403,
            detail=str(exc),
        ) from exc
    except IntegrationUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc
