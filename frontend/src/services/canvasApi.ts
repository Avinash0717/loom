import { api } from "./api";

export interface CanvasResponse {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCanvasRequest {
    prompt: string;
}

export function createCanvas(prompt: string) {
    return api.post<CanvasResponse>("/canvas", {
        prompt,
    });
}

export interface PromptResponse {
    id: number;
    content: string;
    response: string | null;
    created_at: string;
}

export interface CanvasWithPromptsResponse {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    prompts: PromptResponse[];
}

export function getCanvas(canvasId: number) {
    return api.get<CanvasWithPromptsResponse>(`/canvas/${canvasId}`);
}

export function sendPrompt(canvasId: number, prompt: string) {
    return api.post<PromptResponse>(`/canvas/${canvasId}/prompt`, {
        prompt,
    });
}

export function getCanvases() {
    return api.get<CanvasResponse[]>("/canvas");
}

export function deleteCanvas(canvasId: number) {
    return api.delete<{ message: string }>(
        `/canvas/${canvasId}`
    );
}

export interface CanvasToolResponse {
    id: number;
    tool_id: string;
    position: {
        x: number;
        y: number;
    };
}

export interface CreateCanvasToolRequest {
    tool_id: string;
    position: {
        x: number;
        y: number;
    };
}

export function getCanvasTools(canvasId: number) {
    return api.get<CanvasToolResponse[]>(
        `/canvas/${canvasId}/tools`
    );
}

export function addCanvasTool(
    canvasId: number,
    toolId: string,
    position: { x: number; y: number }
) {
    return api.post<CanvasToolResponse>(
        `/canvas/${canvasId}/tools`,
        {
            tool_id: toolId,
            position,
        }
    );
}

export function deleteCanvasTool(
    canvasId: number,
    canvasToolId: number
) {
    return api.delete<{ message: string }>(
        `/canvas/${canvasId}/tools/${canvasToolId}`
    );
}

export function updateCanvasTool(
    canvasId: number,
    canvasToolId: number,
    position: { x: number; y: number }
) {
    return api.patch<CanvasToolResponse>(
        `/canvas/${canvasId}/tools/${canvasToolId}`,
        {
            position,
        }
    );
}