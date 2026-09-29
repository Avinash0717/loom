import { api } from "./api";
import type { WorkspaceResponse } from "../types/workspace";

export function getWorkspace() {
    return api.get<WorkspaceResponse>("/workspace");
}

export function switchWorkspace(workspaceId: string) {
    return api.put("/workspace", { workspaceId });
}