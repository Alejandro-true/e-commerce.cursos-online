from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review

from sqlalchemy.exc import SQLAlchemyError

from app.clients.catalog import CatalogClient
from app.core.exceptions import CourseAccessDeniedError
from app.schemas.review import ReviewCreate


def list_reviews(
    db: Session,
    curso_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[Review]:
    statement = (
        select(Review)
        .where(
            Review.curso_id == curso_id,
            Review.oculta.is_(False),
        )
        .order_by(Review.creada_en.desc(), Review.id.desc())
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())

def create_review(
    db: Session,
    data: ReviewCreate,
    estudiante_id: int,
    catalog_client: CatalogClient,
) -> Review:
    access = catalog_client.has_active_access(
        estudiante_id=estudiante_id,
        curso_id=data.curso_id,
    )

    if access is not True:
        raise CourseAccessDeniedError(
            "No tienes acceso vigente a este curso."
        )

    review = Review(
        curso_id=data.curso_id,
        estudiante_id=estudiante_id,
        calificacion=data.calificacion,
        comentario=data.comentario,
    )

    try:
        db.add(review)
        db.flush()
        db.refresh(review)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    return review