from datetime import datetime
from pydantic import BaseModel

class CanvasCreate(BaseModel):
    prompt: str

class CanvasResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    model_config = {
        "from_attributes": True
    }

class PromptResponse(BaseModel):
    id: int
    content: str
    response: str | None
    created_at: datetime
    model_config = {
        "from_attributes": True
    }

class CanvasWithPromptsResponse(CanvasResponse):
    prompts: list[PromptResponse]

class CanvasToolCreate(BaseModel):
    tool_id: str
    position: dict[str, float] = {
        "x": 0.0,
        "y": 0.0
    }

class CanvasToolResponse(BaseModel):
    id: int
    tool_id: str
    position: dict[str, float]
    model_config = {
        "from_attributes": True
    }

class CanvasToolUpdate(BaseModel):
    position: dict[str, float]