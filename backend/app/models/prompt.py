from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone

from app.db.database import Base

class Prompt(Base):
    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    canvas_id: Mapped[int] = mapped_column(
        ForeignKey("canvases.id", ondelete="CASCADE"),
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    response: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )