import pytest
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError

from app.core.security import get_current_admin_id
from app.main import app
from app.models import Review, ReviewModeration
from app.schemas.moderation import ReviewHideRequest
from app.services.moderation_service import hide_review


@pytest.fixture
def admin_client(client, monkeypatch):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_admin_id,
        lambda: 7,
    )
    return client


@pytest.fixture
def review_id(session_factory):
    with session_factory() as db:
        review = Review(
            curso_id=1,
            estudiante_id=42,
            calificacion=5,
            comentario="Comentario de prueba",
        )
        db.add(review)
        db.commit()
        return review.id


def count_audits(session_factory):
    with session_factory() as db:
        return db.scalar(
            select(func.count()).select_from(ReviewModeration)
        )


def assert_review_state(session_factory, review_id, hidden):
    with session_factory() as db:
        review = db.get(Review, review_id)
        assert review is not None
        assert review.oculta is hidden


def test_ocultar_resena_y_guardar_auditoria(
    admin_client,
    review_id,
    session_factory,
):
    response = admin_client.patch(
        f"/resenas/{review_id}/ocultar",
        json={"motivo": "  Lenguaje ofensivo  "},
    )

    assert response.status_code == 200, response.text
    assert_review_state(session_factory, review_id, hidden=True)

    with session_factory() as db:
        audits = db.scalars(select(ReviewModeration)).all()

        assert len(audits) == 1
        assert audits[0].id == response.json()["id"]
        assert audits[0].resena_id == review_id
        assert audits[0].administrador_id == 7
        assert audits[0].motivo == "Lenguaje ofensivo"
        assert audits[0].moderada_en is not None

    listing = admin_client.get(
        "/resenas",
        params={"curso_id": 1},
    )
    assert listing.status_code == 200
    assert listing.json() == []


def test_resena_inexistente_devuelve_404(
    admin_client,
    session_factory,
):
    response = admin_client.patch(
        "/resenas/999/ocultar",
        json={"motivo": "Contenido ofensivo"},
    )

    assert response.status_code == 404, response.text
    assert count_audits(session_factory) == 0


def test_ocultar_dos_veces_no_duplica_auditoria(
    admin_client,
    review_id,
    session_factory,
):
    first = admin_client.patch(
        f"/resenas/{review_id}/ocultar",
        json={"motivo": "Primer motivo"},
    )
    assert first.status_code == 200, first.text

    second = admin_client.patch(
        f"/resenas/{review_id}/ocultar",
        json={"motivo": "Otro motivo"},
    )
    assert second.status_code == 409, second.text

    with session_factory() as db:
        audits = db.scalars(select(ReviewModeration)).all()

        assert len(audits) == 1
        assert audits[0].motivo == "Primer motivo"

    assert_review_state(session_factory, review_id, hidden=True)


def test_usuario_sin_permiso_no_puede_ocultar(
    client,
    review_id,
    session_factory,
    monkeypatch,
):
    def deny_admin():
        raise HTTPException(
            status_code=403,
            detail="Se requiere rol administrador.",
        )

    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_admin_id,
        deny_admin,
    )

    response = client.patch(
        f"/resenas/{review_id}/ocultar",
        json={"motivo": "Contenido ofensivo"},
    )

    assert response.status_code == 403, response.text
    assert_review_state(session_factory, review_id, hidden=False)
    assert count_audits(session_factory) == 0


@pytest.mark.parametrize(
    "payload",
    [
        {"motivo": "   "},
        {"motivo": "Contenido ofensivo", "administrador_id": 999},
    ],
)
def test_rechazar_datos_invalidos(
    admin_client,
    review_id,
    session_factory,
    payload,
):
    response = admin_client.patch(
        f"/resenas/{review_id}/ocultar",
        json=payload,
    )

    assert response.status_code == 422, response.text
    assert_review_state(session_factory, review_id, hidden=False)
    assert count_audits(session_factory) == 0


def test_fallo_al_guardar_revierte_ambos_cambios(
    session_factory,
    review_id,
    monkeypatch,
):
    with session_factory() as db:
        original_flush = db.flush

        def fail_after_flush(*args, **kwargs):
            original_flush(*args, **kwargs)
            raise SQLAlchemyError("Fallo simulado despues de flush")

        monkeypatch.setattr(db, "flush", fail_after_flush)

        with pytest.raises(SQLAlchemyError, match="Fallo simulado"):
            hide_review(
                db=db,
                resena_id=review_id,
                data=ReviewHideRequest(motivo="Prueba de rollback"),
                administrador_id=7,
            )

        assert db.get(Review, review_id).oculta is False
        assert db.scalar(
            select(func.count()).select_from(ReviewModeration)
        ) == 0