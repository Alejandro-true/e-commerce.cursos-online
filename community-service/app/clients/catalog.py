from app.core.exceptions import IntegrationUnavailableError


class CatalogClient:
    def has_active_access(
        self,
        estudiante_id: int,
        curso_id: int,
    ) -> bool:
        raise IntegrationUnavailableError(
            "Validación de acceso no disponible."
        )


def get_catalog_client() -> CatalogClient:
    return CatalogClient()