from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String, Text, false, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Review(Base):
    __tablename__ = "resenas"

    __table_args__ = (
        CheckConstraint(
            "calificacion BETWEEN 1 AND 5",
            name="ck_resenas_calificacion",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    curso_id: Mapped[str] = mapped_column(String(36), index=True)
    estudiante_id: Mapped[str] = mapped_column(String(100), index=True)
    calificacion: Mapped[int] = mapped_column(Integer)
    comentario: Mapped[str | None] = mapped_column(Text, nullable=True)
    oculta: Mapped[bool] = mapped_column(
        Boolean,
        server_default=false(),
    )
    creada_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
