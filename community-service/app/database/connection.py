from sqlalchemy import URL, create_engine, text

from app.core.config import settings

database_url = URL.create(
    drivername="postgresql+psycopg",
    username=settings.db_user,
    password=settings.db_password.get_secret_value(),
    host=settings.db_host,
    port=settings.db_port,
    database=settings.db_name,
)

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)


def check_connection() -> str:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database()"))
        return result.scalar_one()