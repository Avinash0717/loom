from sqlalchemy import select
from .database import session_local
from app.models import Workspace, Tool
from .workspace_defaults import WORKSPACES, TOOLS, WORKSPACE_DEFAULT_CONFIG

TOOLS = [
    {
        "id": "tasks",
        "name": "Tasks",
        "description": "Create and manage tasks",
        "domain": "productivity",
        "tags": [
            "tasks",
            "todo",
            "productivity"
        ],
        "ui_type": "task_widget",
        "available_actions": [
            "create_task",
            "update_task",
            "delete_task",
            "get_task"
        ],
    },
    {
        "id": "notes",
        "name": "Notes",
        "description": "Create and manage notes",
        "domain": "productivity",
        "tags": [
            "notes",
            "writing",
            "productivity"
        ],
        "ui_type": "notes_widget",
        "available_actions": [
            "create_note",
            "update_note",
            "delete_note",
            "get_note"
        ],
    },
    {
        "id": "calendar",
        "name": "Calendar",
        "description": "Create and manage calendar events",
        "domain": "productivity",
        "tags": [
            "calendar",
            "events",
            "schedule"
        ],
        "ui_type": "calendar_widget",
        "available_actions": [
            "create_event",
            "update_event",
            "delete_event",
            "get_event"
        ],
    },
    {
        "id": "inventory",
        "name": "Inventory",
        "description": "Manage products and inventory",
        "domain": "retail",
        "tags": [
            "inventory",
            "products",
            "retail"
        ],
        "ui_type": "inventory_widget",
        "available_actions": [
            "create_item",
            "update_item",
            "delete_item",
            "get_item"
        ],
    },
]

WORKSPACES = [
    {
        "id": "default",
        "name": "Default",
        "description": "A blank workspace that can be customized",
        "tools": []
    },
    {
        "id": "student",
        "name": "Student",
        "description": "Workspace designed for students",
        "tools": [
            "tasks",
            "notes",
            "calendar",
            "inventory",
        ]
    },
    {
        "id": "retail",
        "name": "Retail",
        "description": "Workspace designed for retail and shop management",
        "tools": [
            "tasks",
            "notes",
            "calendar",
            "inventory",
        ]
    },
]

def seed_database():
    db = session_local()

    try:
        for tool_data in TOOLS:
            tool = db.scalar(
                select(Tool).where(Tool.id == tool_data["id"])
            )

            if tool is None:
                tool = Tool(
                    id=tool_data["id"],
                    name=tool_data["name"],
                    description=tool_data["description"],
                    domain=tool_data["domain"],
                    tags=tool_data["tags"],
                    ui_type=tool_data["ui_type"],
                    available_actions=tool_data["available_actions"],
                )
                db.add(tool)

        db.flush()

        for workspace_data in WORKSPACES:
            workspace = db.scalar(
                select(Workspace).where(
                    Workspace.id == workspace_data["id"]
                )
            )

            if workspace is None:
                workspace = Workspace(
                    id=workspace_data["id"],
                    name=workspace_data["name"],
                    description=workspace_data["description"],
                )
                db.add(workspace)

        db.commit()

        print("Database seeded successfully")

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()