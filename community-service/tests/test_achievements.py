from app.core.security import get_current_student_id
from app.main import app
from app.schemas.reward import ModuleCompletedData
from app.services.reward_service import grant_module_reward


def test_logros_vacios(client):
    response = client.get("/logros/me")

    assert response.status_code == 200, response.text
    assert response.json() == {
        "estudiante_id": 42,
        "puntos_totales": 0,
        "insignias": [],
    }


def test_devuelve_solo_logros_del_estudiante(
    client,
    session_factory,
):
    with session_factory() as db:
        for estudiante_id, modulo_id in [(42, 1), (42, 2), (99, 3)]:
            grant_module_reward(
                db,
                ModuleCompletedData(
                    estudiante_id=estudiante_id,
                    modulo_id=modulo_id,
                ),
            )

    response = client.get("/logros/me")

    assert response.status_code == 200, response.text

    data = response.json()
    assert data["estudiante_id"] == 42
    assert data["puntos_totales"] == 20
    assert {
        badge["modulo_id"] for badge in data["insignias"]
    } == {1, 2}


def test_logros_exigen_identidad_validada(client):
    app.dependency_overrides.pop(get_current_student_id)

    response = client.get("/logros/me")

    assert response.status_code == 503, response.text