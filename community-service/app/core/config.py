from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "comunidad_db"
    db_user: str = "comunidad_user"
    db_password: SecretStr
    auth_mode: str = "strict"
    catalog_service_url: str = "http://localhost:8080"
    service_api_key: str = ""
    rabbitmq_url: str = ""
    rabbitmq_exchange: str = "aulabreve.domain.events"
    rabbitmq_queue: str = "community.modulo-completado"
    cors_allowed_origins: str = "http://localhost:4200,http://127.0.0.1:4200"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
