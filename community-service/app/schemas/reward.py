from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ModuleCompletedData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    estudiante_id: int = Field(gt=0, strict=True)
    modulo_id: int = Field(gt=0, strict=True)

class BadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    modulo_id: int
    insignia: str
    otorgada_en: datetime


class StudentAchievementsResponse(BaseModel):
    estudiante_id: int
    puntos_totales: int
    insignias: list[BadgeResponse]