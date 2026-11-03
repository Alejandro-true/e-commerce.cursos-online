from app.core.exceptions import IntegrationUnavailableError
from urllib.parse import quote

import httpx

from app.core.config import settings


class CatalogClient:
    def has_active_access(
        self,
        estudiante_id: str,
        curso_id: str,
    ) -> bool:
        if not settings.service_api_key:
            raise IntegrationUnavailableError("SERVICE_API_KEY no está configurada.")
        url = (
            f"{settings.catalog_service_url.rstrip('/')}/api/internal/progreso/"
            f"cursos/{quote(curso_id, safe='')}/acceso/{quote(estudiante_id, safe='')}"
        )
        try:
            response = httpx.get(
                url,
                headers={"X-Service-Key": settings.service_api_key},
                timeout=4.0,
            )
        except httpx.HTTPError as exc:
            raise IntegrationUnavailableError("No se pudo consultar Catalog Service.") from exc
        if response.status_code in (403, 404):
            return False
        if response.status_code >= 500:
            raise IntegrationUnavailableError("Catalog Service no está disponible.")
        if response.is_error:
            raise IntegrationUnavailableError("Catalog Service rechazó la consulta de acceso.")
        return response.json().get("estado") == "ACTIVO"


def get_catalog_client() -> CatalogClient:
    return CatalogClient()
