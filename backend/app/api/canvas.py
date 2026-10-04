from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import (
    Canvas,
    Prompt, 
    User,
    CanvasTool,
    Tool
)

from app.schemas.canvas import (
    CanvasCreate,
    CanvasResponse,
    CanvasWithPromptsResponse,
    PromptResponse,
    CanvasToolCreate,
    CanvasToolResponse,
    CanvasToolUpdate
)

from app.services.canvas_commands import (
    parse_canvas_action,
    CanvasCommandError,
)

from .user import get_current_user
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/v1/canvas",
    tags=["Canvas"]
)

def get_next_tool_position(
    db: Session,
    canvas_id: int
) -> dict[str, float]:

    existing_tools = db.scalars(
        select(CanvasTool).where(
            CanvasTool.canvas_id == canvas_id
        )
    ).all()

    index = len(existing_tools)

    columns = 3
    x_spacing = 350
    y_spacing = 300

    column = index % columns
    row = index // columns

    return {
        "x": 100.0 + (column * x_spacing),
        "y": 100.0 + (row * y_spacing),
    }

@router.post("", response_model=CanvasResponse)
def create_canvas(
    data: CanvasCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        existing_canvas_count = db.scalar(
            select(func.count()).select_from(Canvas).where(
                Canvas.user_id == user.id
            )
        )

        canvas_number = existing_canvas_count + 1
        title = f"Canvas {canvas_number}"

        canvas = Canvas(
            user_id=user.id,
            title=title,
        )

        db.add(canvas)
        db.flush()

        prompt = Prompt(
            canvas_id=canvas.id,
            content=data.prompt,
            response="Response"
        )

        db.add(prompt)

        db.commit()
        db.refresh(canvas)

        return canvas

    except Exception:
        db.rollback()
        raise

@router.get("", response_model=list[CanvasResponse])
def get_canvases(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvases = db.scalars(
        select(Canvas).where(
            Canvas.user_id == user.id).order_by(
                Canvas.updated_at.desc()
        )
    ).all()

    return canvases

@router.delete("/{canvas_id}")
def delete_canvas(
    canvas_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    db.delete(canvas)
    db.commit()

    return {
        "message": "Canvas deleted successfully"
    }
    
    
@router.get("/{canvas_id}", response_model=CanvasWithPromptsResponse)
def get_canvas(
    canvas_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    prompts = db.scalars(
        select(Prompt).where(
            Prompt.canvas_id == canvas.id
        ).order_by(Prompt.created_at)
    ).all()

    return {
        "id": canvas.id,
        "title": canvas.title,
        "created_at": canvas.created_at,
        "updated_at": canvas.updated_at,
        "prompts": prompts
    }

@router.post("/{canvas_id}/prompt", response_model=PromptResponse)
def create_prompt(
    canvas_id: int,
    data: CanvasCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    try:
        action = parse_canvas_action(data.prompt)

        response = "Response"

        if action:
            action_type = action.get("action")

            if action_type == "add_tool":
                tool_id = action.get("tool")

                if not tool_id:
                    raise CanvasCommandError(
                        "add_tool requires a 'tool' field"
                    )

                tool = db.scalar(
                    select(Tool).where(
                        Tool.id == tool_id
                    )
                )

                if not tool:
                    raise CanvasCommandError(
                        f"Tool not found: {tool_id}"
                    )

                canvas_tool = CanvasTool(
                    canvas_id=canvas.id,
                    tool_id=tool.id,
                    position=get_next_tool_position(
                        db,
                        canvas_id
                    )
                )

                db.add(canvas_tool)

                response = f"Added {tool.name} to the canvas."

            elif action_type == "remove_tool":
                canvas_tool_id = action.get("canvas_tool_id")

                if canvas_tool_id is None:
                    raise CanvasCommandError(
                        "remove_tool requires a 'canvas_tool_id' field"
                    )

                canvas_tool = db.scalar(
                    select(CanvasTool).where(
                        CanvasTool.id == canvas_tool_id,
                        CanvasTool.canvas_id == canvas.id
                    )
                )

                if not canvas_tool:
                    raise CanvasCommandError(
                        "Canvas tool not found"
                    )

                db.delete(canvas_tool)

                response = "Tool removed from the canvas."

            elif action_type == "tool_action":
                raise CanvasCommandError(
                    "tool_action is not supported yet"
                )

            else:
                raise CanvasCommandError(
                    f"Unsupported canvas action: {action_type}"
                )

        prompt = Prompt(
            canvas_id=canvas.id,
            content=data.prompt,
            response=response
        )

        db.add(prompt)

        canvas.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(prompt)

        return prompt

    except CanvasCommandError as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        db.rollback()
        raise

@router.get("/{canvas_id}/tools", response_model=list[CanvasToolResponse])
def get_canvas_tools(
    canvas_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    tools = db.scalars(
        select(CanvasTool).where(
            CanvasTool.canvas_id == canvas.id
        )
    ).all()

    return tools

@router.post("/{canvas_id}/tools", response_model=CanvasToolResponse)
def add_canvas_tool(
    canvas_id: int,
    data: CanvasToolCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    tool = db.scalar(
        select(Tool).where(
            Tool.id == data.tool_id
        )
    )

    if not tool:
        raise HTTPException(
            status_code=404,
            detail="Tool not found"
        )

    canvas_tool = CanvasTool(
        canvas_id=canvas.id,
        tool_id=tool.id,
        position=data.position
    )

    db.add(canvas_tool)

    try:
        canvas.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(canvas_tool)

        return canvas_tool

    except Exception:
        db.rollback()
        raise

@router.delete("/{canvas_id}/tools/{canvas_tool_id}")
def delete_canvas_tool(
    canvas_id: int,
    canvas_tool_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    canvas_tool = db.scalar(
        select(CanvasTool).where(
            CanvasTool.id == canvas_tool_id,
            CanvasTool.canvas_id == canvas.id
        )
    )

    if not canvas_tool:
        raise HTTPException(
            status_code=404,
            detail="Canvas tool not found"
        )

    try:
        db.delete(canvas_tool)
        canvas.updated_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "message": "Canvas tool deleted successfully",
        }

    except Exception:
        db.rollback()
        raise

@router.patch("/{canvas_id}/tools/{canvas_tool_id}", response_model=CanvasToolResponse)
def update_canvas_tool(
    canvas_id: int,
    canvas_tool_id: int,
    data: CanvasToolUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.scalar(
        select(Canvas).where(
            Canvas.id == canvas_id,
            Canvas.user_id == user.id
        )
    )

    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )

    canvas_tool = db.scalar(
        select(CanvasTool).where(
            CanvasTool.id == canvas_tool_id,
            CanvasTool.canvas_id == canvas.id
        )
    )

    if not canvas_tool:
        raise HTTPException(
            status_code=404,
            detail="Canvas tool not found"
        )

    try:
        canvas_tool.position = data.position
        canvas.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(canvas_tool)

        return canvas_tool

    except Exception:
        db.rollback()
        raise