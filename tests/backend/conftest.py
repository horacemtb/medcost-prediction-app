import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base


@pytest.fixture(autouse=True)
def clear_external_service_env(monkeypatch):
    monkeypatch.delenv("DADATA_API_KEY", raising=False)
    monkeypatch.delenv("DADATA_API_SECRET", raising=False)


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def isolated_database_url(tmp_path, monkeypatch):
    db_path = tmp_path / "app-test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    return f"sqlite:///{db_path}"
