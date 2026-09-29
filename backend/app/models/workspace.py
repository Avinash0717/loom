from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

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