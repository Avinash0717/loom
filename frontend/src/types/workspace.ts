export interface ToolConfig {
    id: string;
    enabled: boolean;
}

export interface Workspace {
    id: string;
    name: string;
    description: string;
    tools: ToolConfig[];
}

export interface WorkspaceResponse {
    activeWorkspace: Workspace;
    availableWorkspaces: Workspace[];
}