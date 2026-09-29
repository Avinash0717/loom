from pydantic import BaseModel

class WorkspaceUpdate(BaseModel):
    workspaceId: str