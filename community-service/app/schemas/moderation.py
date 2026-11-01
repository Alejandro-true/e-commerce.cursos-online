from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewHideRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    motivo: str = Field(min_length=1)


class ReviewModerationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resena_id: int
    administrador_id: int
    motivo: str
    moderada_en: datetime