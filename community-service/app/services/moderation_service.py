from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    ReviewAlreadyHiddenError,
    ReviewNotFoundError,
)
from app.models.review import Review
from app.models.review_moderation import ReviewModeration
from app.schemas.moderation import ReviewHideRequest


def hide_review(
    db: Session,
    resena_id: int,
    data: ReviewHideRequest,
    administrador_id: str,
) -> ReviewModeration:
    try:
        review = db.scalar(
            select(Review)
            .where(Review.id == resena_id)
            .with_for_update()
        )

        if review is None:
            raise ReviewNotFoundError("Reseña no encontrada.")

        if review.oculta:
            raise ReviewAlreadyHiddenError(
                "La reseña ya está oculta."
            )

        review.oculta = True

        moderation = ReviewModeration(
            resena_id=review.id,
            administrador_id=administrador_id,
            motivo=data.motivo,
        )

        db.add(moderation)
        db.flush()
        db.refresh(moderation)
        db.commit()

        return moderation

    except (
        SQLAlchemyError,
        ReviewNotFoundError,
        ReviewAlreadyHiddenError,
    ):
        db.rollback()
        raise
