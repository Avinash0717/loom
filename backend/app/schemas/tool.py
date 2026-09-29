from pydantic import BaseModel

class ToolResponse(BaseModel):
    id: str
    name: str
    description: str
    domain: str
    tags: list[str]
    ui_type: str
    available_actions: list[str]

class ToolToggle(BaseModel):
    enabled: bool