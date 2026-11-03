from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ReviewModeration(Base):
    __tablename__ = "moderaciones_resenas"

    __table_args__ = (
        CheckConstraint(
            "length(trim(motivo)) > 0",
            name="ck_moderaciones_resenas_motivo",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    resena_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "resenas.id",
            name="fk_moderaciones_resenas_resena",
            ondelete="RESTRICT",
        ),
        index=True,
    )

    administrador_id: Mapped[str] = mapped_column(String(100))
    motivo: Mapped[str] = mapped_column(Text)

    moderada_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
