import json

class CanvasCommandError(Exception):
    pass

def parse_canvas_action(prompt: str) -> dict | None:
    prefix = "CanvasAction:"

    if not prompt.startswith(prefix):
        return None

    raw_action = prompt[len(prefix):].strip()

    if not raw_action:
        raise CanvasCommandError(
            "Canvas action is empty"
        )

    try:
        action = json.loads(raw_action)
    
    except json.JSONDecodeError:
        raise CanvasCommandError(
            "Invalid canvasAction JSON"
        )

    if not isinstance(action, dict):
        raise CanvasCommandError(
            "Canvas action must contain a JSON object"
        )

    return action