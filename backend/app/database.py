"""Database engine and session management."""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

if settings.database_url.startswith("sqlite"):
    # check_same_thread is only needed for the local SQLite fallback.
    connect_args = {"check_same_thread": False}
elif settings.database_url.startswith("postgresql"):
    # Supabase's transaction pooler (Supavisor, port 6543) does not support
    # server-side prepared statements, which psycopg uses by default. Disable
    # them so the app is safe behind the pooler.
    connect_args = {"prepare_threshold": None}
else:
    connect_args = {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
