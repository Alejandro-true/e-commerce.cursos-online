from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Integer,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ModuleReward(Base):
    __tablename__ = "recompensas_modulos"

    __table_args__ = (
        UniqueConstraint(
            "estudiante_id",
            "modulo_id",
            name="uq_recompensas_estudiante_modulo",
        ),
        CheckConstraint(
            "puntos = 10",
            name="ck_recompensas_puntos",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    estudiante_id: Mapped[str] = mapped_column(String(100))
    modulo_id: Mapped[str] = mapped_column(String(36))

    puntos: Mapped[int] = mapped_column(
        Integer,
        server_default=text("10"),
    )

    insignia: Mapped[str] = mapped_column(String(100))

    otorgada_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
