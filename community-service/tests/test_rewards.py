import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError

from app.models.module_reward import ModuleReward
from app.schemas.reward import ModuleCompletedData
from app.services.reward_service import (
    get_total_points,
    grant_module_reward,
)


def count_rewards(db):
    return db.scalar(
        select(func.count()).select_from(ModuleReward)
    )


def test_otorga_insignia_y_diez_puntos(session_factory):
    data = ModuleCompletedData(estudiante_id=42, modulo_id=3)

    with session_factory() as db:
        reward, created = grant_module_reward(db, data)
        reward_id = reward.id

        assert created is True
        assert reward.puntos == 10
        assert reward.insignia == "MODULO_3_COMPLETADO"
        assert reward.otorgada_en is not None

    with session_factory() as db:
        assert db.get(ModuleReward, reward_id) is not None
        assert count_rewards(db) == 1
        assert get_total_points(db, 42) == 10


def test_modulo_repetido_no_duplica_premio(session_factory):
    data = ModuleCompletedData(estudiante_id=42, modulo_id=3)

    with session_factory() as db:
        original, _ = grant_module_reward(db, data)
        original_id = original.id

    with session_factory() as db:
        repeated, created = grant_module_reward(db, data)

        assert created is False
        assert repeated.id == original_id
        assert count_rewards(db) == 1
        assert get_total_points(db, 42) == 10


def test_modulos_distintos_acumulan_puntos(session_factory):
    with session_factory() as db:
        first, _ = grant_module_reward(
            db,
            ModuleCompletedData(estudiante_id=42, modulo_id=1),
        )
        second, _ = grant_module_reward(
            db,
            ModuleCompletedData(estudiante_id=42, modulo_id=2),
        )

        assert first.insignia == "MODULO_1_COMPLETADO"
        assert second.insignia == "MODULO_2_COMPLETADO"
        assert count_rewards(db) == 2
        assert get_total_points(db, 42) == 20


def test_estudiantes_reciben_premios_independientes(
    session_factory,
):
    with session_factory() as db:
        grant_module_reward(
            db,
            ModuleCompletedData(estudiante_id=42, modulo_id=3),
        )
        grant_module_reward(
            db,
            ModuleCompletedData(estudiante_id=99, modulo_id=3),
        )

        assert count_rewards(db) == 2
        assert get_total_points(db, 42) == 10
        assert get_total_points(db, 99) == 10


def test_estudiante_sin_recompensas_tiene_cero_puntos(
    session_factory,
):
    with session_factory() as db:
        assert get_total_points(db, 42) == 0


def test_fallo_al_guardar_revierte_recompensa(
    session_factory,
    monkeypatch,
):
    with session_factory() as db:
        original_flush = db.flush

        def fail_after_flush(*args, **kwargs):
            original_flush(*args, **kwargs)
            raise SQLAlchemyError("Fallo simulado despues de flush")

        monkeypatch.setattr(db, "flush", fail_after_flush)

        with pytest.raises(SQLAlchemyError, match="Fallo simulado"):
            grant_module_reward(
                db,
                ModuleCompletedData(
                    estudiante_id=42,
                    modulo_id=3,
                ),
            )

        assert count_rewards(db) == 0
        assert get_total_points(db, 42) == 0