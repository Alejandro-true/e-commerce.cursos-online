from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ModuleCompletedData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    estudiante_id: str = Field(min_length=1, max_length=100)
    modulo_id: str = Field(min_length=1, max_length=36)

class BadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    modulo_id: str
    insignia: str
    otorgada_en: datetime


class StudentAchievementsResponse(BaseModel):
    estudiante_id: str
    puntos_totales: int
    insignias: list[BadgeResponse]
