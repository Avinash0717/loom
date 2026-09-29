from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Tool, User, UserWorkspaceTool
from app.schemas.tool import ToolResponse, ToolToggle
from .user import get_current_user

router = APIRouter(
    prefix="/api/v1/tools",
    tags=["Tools"]
)

@router.get("", response_model=list[ToolResponse])
def get_tools(db: Session = Depends(get_db)):
    tools = db.scalars(
        select(Tool)
    ).all()

    return tools

@router.put("/{tool_id}")
def toggle_tool(
    tool_id: str,
    data: ToolToggle,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool_config = db.scalar(
        select(UserWorkspaceTool).where(
            UserWorkspaceTool.user_id == user.id,
            UserWorkspaceTool.workspace_id == user.active_workspace_id,
            UserWorkspaceTool.tool_id == tool_id,
        )
    )

    if tool_config is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_id}' is not configured for this workspace"
        )

    tool_config.enabled = data.enabled

    db.commit()

    return {
        "message": "Tool configuration updated successfully",
        "toolId": tool_id,
        "enabled": tool_config.enabled
    }