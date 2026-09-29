from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class UserWorkspaceTool(Base):
    __tablename__ = "user_workspace_tools"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True
    )

    workspace_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("workspaces.id"),
        primary_key=True
    )

    tool_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("tools.id"),
        primary_key=True
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )