from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    curso_id: str = Field(min_length=1, max_length=36)
    calificacion: int = Field(ge=1, le=5, strict=True)
    comentario: str | None = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    curso_id: str
    estudiante_id: str
    calificacion: int
    comentario: str | None
    oculta: bool
    creada_en: datetime
