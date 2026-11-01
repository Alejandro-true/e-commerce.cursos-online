from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.clients.catalog import CatalogClient, get_catalog_client
from app.core.security import get_current_student_id
from app.database.session import get_db
from app.main import app
from app.models import Base


@pytest.fixture
def session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)

    factory = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )

    try:
        yield factory
    finally:
        engine.dispose()


@pytest.fixture
def catalog_client():
    catalog = Mock(spec=CatalogClient)
    catalog.has_active_access.return_value = True
    return catalog


@pytest.fixture
def client(session_factory, catalog_client):
    def override_get_db():
        with session_factory() as db:
            yield db

    previous_overrides = app.dependency_overrides.copy()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_student_id] = lambda: 42
    app.dependency_overrides[get_catalog_client] = lambda: catalog_client

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous_overrides)