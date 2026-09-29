from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DB_URL = "sqlite:///./loom.db"

class Base(DeclarativeBase):
    pass

engine = create_engine(
    DB_URL,
    connect_args={
        "check_same_thread": False
    }
)

session_local = sessionmaker(
    bind = engine,
    autocommit = False,
    autoflush = False
)

def get_db():
    db = session_local()

    try:
        yield db
    finally:
        db.close()