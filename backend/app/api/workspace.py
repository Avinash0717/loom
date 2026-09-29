from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.workspace_defaults import WORKSPACE_DEFAULT_CONFIG
from app.models import Workspace, UserWorkspaceTool, User
from app.schemas.workspace import WorkspaceUpdate
from .user import get_current_user

router = APIRouter(
    prefix="/api/v1/workspace",
    tags=["Workspace"]
)

@router.get("")
def get_workspace(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):

    workspaces = db.scalars(
        select(Workspace)
    ).all()

    result = []

    for workspace in workspaces:
        tools = db.scalars(
            select(UserWorkspaceTool).where(
                UserWorkspaceTool.user_id == user.id,
                UserWorkspaceTool.workspace_id == workspace.id,
                )
            ).all()

        result.append({
            "id": workspace.id,
            "name": workspace.name,
            "description": workspace.description,
            "tools": [
                {
                    "id": tool.tool_id,
                    "enabled": tool.enabled,
                }
                for tool in tools
                ]
            })

    active_workspace = next(
        workspace for workspace in result if workspace["id"] == user.active_workspace_id
    )

    return {
        "activeWorkspace": active_workspace,
        "availableWorkspaces": result
    }

@router.put("")
def switch_workspace(
        data: WorkspaceUpdate,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
    
    workspace = db.get(Workspace, data.workspaceId)

    if workspace is None:
        raise HTTPException(
            status_code=404,
            detail=f"Workspace '{data.workspaceId}' does not exist"
        )

    existing_tools = db.scalars(
        select(UserWorkspaceTool).where(
            UserWorkspaceTool.user_id == user.id,
            UserWorkspaceTool.workspace_id == workspace.id
        )
    ).all()

    existing_tool_ids = {
        tool.tool_id for tool in existing_tools
    }

    tool_ids = WORKSPACE_DEFAULT_CONFIG.get(workspace.id, [])

    for tool_id in tool_ids:
        if tool_id not in existing_tool_ids:
            association = UserWorkspaceTool(
                user_id=user.id,
                workspace_id=workspace.id,
                tool_id=tool_id,
                enabled=False
            )

            db.add(association)
            
    user.active_workspace_id = data.workspaceId

    db.commit()

    return {
        "message": "Workspace switched successfully",
        "activeWorkspace": data.workspaceId
    }