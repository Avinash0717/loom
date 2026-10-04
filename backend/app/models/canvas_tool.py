from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class CanvasTool(Base):
    __tablename__ = "canvas_tools"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    canvas_id: Mapped[int] = mapped_column(
        ForeignKey("canvases.id", ondelete="CASCADE"),
        nullable=False
    )

    tool_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("tools.id", ondelete="CASCADE"),
        nullable=False
    )

    position: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict
    )