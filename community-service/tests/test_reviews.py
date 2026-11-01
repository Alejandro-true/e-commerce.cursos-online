from sqlalchemy import func, select

from app.clients.catalog import get_catalog_client
from app.core.security import get_current_student_id
from app.main import app
from app.models.review import Review

PAYLOAD = {
    "curso_id": 1,
    "calificacion": 5,
    "comentario": "Buen curso",
}


def count_reviews(session_factory):
    with session_factory() as db:
        return db.scalar(
            select(func.count()).select_from(Review)
        )


def test_crear_resena_con_acceso(
    client,
    catalog_client,
    session_factory,
):
    response = client.post("/resenas", json=PAYLOAD)

    assert response.status_code == 201, response.text

    data = response.json()
    assert data["estudiante_id"] == 42
    assert data["curso_id"] == 1
    assert data["calificacion"] == 5
    assert data["oculta"] is False

    catalog_client.has_active_access.assert_called_once_with(
        estudiante_id=42,
        curso_id=1,
    )

    with session_factory() as db:
        saved = db.get(Review, data["id"])
        assert saved is not None
        assert saved.estudiante_id == 42

    assert count_reviews(session_factory) == 1


def test_rechazar_resena_sin_acceso(
    client,
    catalog_client,
    session_factory,
):
    catalog_client.has_active_access.return_value = False

    response = client.post("/resenas", json=PAYLOAD)

    assert response.status_code == 403, response.text
    assert count_reviews(session_factory) == 0


def test_rechazar_si_catalogo_no_esta_disponible(
    client,
    session_factory,
):
    app.dependency_overrides.pop(get_catalog_client)

    response = client.post("/resenas", json=PAYLOAD)

    assert response.status_code == 503, response.text
    assert response.json()["detail"] == (
        "Validación de acceso no disponible."
    )
    assert count_reviews(session_factory) == 0


def test_rechazar_si_autenticacion_esta_pendiente(
    client,
    catalog_client,
    session_factory,
):
    app.dependency_overrides.pop(get_current_student_id)

    response = client.post("/resenas", json=PAYLOAD)

    assert response.status_code == 503, response.text
    assert response.json()["detail"] == (
        "Servicio de autenticación no disponible."
    )
    catalog_client.has_active_access.assert_not_called()
    assert count_reviews(session_factory) == 0


def test_rechazar_estudiante_id_en_el_cuerpo(
    client,
    session_factory,
):
    payload = {**PAYLOAD, "estudiante_id": 999}

    response = client.post("/resenas", json=payload)

    assert response.status_code == 422, response.text
    assert count_reviews(session_factory) == 0