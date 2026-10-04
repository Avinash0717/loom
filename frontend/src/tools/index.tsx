import type { ComponentType } from "react";

import Tasks from "../features/tasks/Tasks";
import Notes from "../features/notes/Notes";
import Calendar from "../features/calendar/Calendar";
import Inventory from "../features/inventory/Inventory";

export interface ToolProps {
    canvasId: number;
    canvasToolId: number;
}
export const TOOL_COMPONENTS: Record<
    string,
    ComponentType<ToolProps>
> = {
    tasks: Tasks,
    notes: Notes,
    calendar: Calendar,
    inventory: Inventory,
};