from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class Tool(Base):
    __tablename__ = "tools"

    id: Mapped[str] = mapped_column(
        String(50),
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    domain: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    tags: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False
    )

    ui_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    available_actions: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False
    )