"""
database.py
-----------
SQLAlchemy engine and session configuration for MySQL.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3306/FMS_db"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # detect stale connections automatically
    pool_size=10,
    max_overflow=20,
    echo=False,               # set True to log SQL queries during development
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


# ─── Dependency (used in FastAPI route injection) ─────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Quick connection check ───────────────────────────────────
def check_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        print(f"[DB] Connection failed: {exc}")
        return False
