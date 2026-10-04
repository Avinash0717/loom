import { useCallback, useEffect, useState } from "react";

import {
    ReactFlow,
    Background,
    Controls,
    applyNodeChanges,
    type OnMove,
    type Node,
    type NodeProps,
    type NodeChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { logout } from "../../services/authApi";
import { CanvasProvider } from "./CanvasContext";

import {
    sendPrompt,
    getCanvas,
    getCanvasTools,
    updateCanvasTool,
    type CanvasToolResponse,
} from "../../services/canvasApi";

import PromptDrawer from "../drawers/PromptDrawer";
import { TOOL_COMPONENTS } from "../../tools";



function ToolNode({ data }: NodeProps) {
    const toolId = data.toolId as keyof typeof TOOL_COMPONENTS;
    const canvasId = data.canvasId as number;
    const canvasToolId = data.canvasToolId as number;

    const ToolComponent = TOOL_COMPONENTS[toolId];

    if (!ToolComponent) {
        return <div>Unknown tool: {String(toolId)}</div>;
    }

    return (
        <ToolComponent
            canvasId={canvasId}
            canvasToolId={canvasToolId}
        />
    );
}

interface CanvasPageProps {
    canvasId: number;
    onHome: () => void;
    onLogout: () => void;
    onCanvasUpdated: () => void;
}


export default function CanvasPage({
    canvasId,
    onHome,
    onLogout,
    onCanvasUpdated,
}: CanvasPageProps) {

    const [zoom, setZoom] = useState(1);

    const [canvas, setCanvas] = useState<
        Awaited<ReturnType<typeof getCanvas>> | null
    >(null);

    const [prompt, setPrompt] = useState("");

    const [sendingPrompt, setSendingPrompt] = useState(false);

    const [promptDrawerOpen, setPromptDrawerOpen] = useState(true);

    const [nodes, setNodes] = useState<Node[]>([]);


    /*
     * Load all tools currently attached to this canvas
     * and convert them into React Flow nodes.
     */
    const loadCanvasTools = useCallback(async () => {
        try {
            const tools = await getCanvasTools(canvasId);

            const newNodes: Node[] = tools.map(
                (tool: CanvasToolResponse) => ({
                    id: tool.id.toString(),
                    type: "tool",
                    position: tool.position,
                    data: {
                        toolId: tool.tool_id,
                        canvasId,
                        canvasToolId: tool.id,
                    },
                })
            );

            setNodes(newNodes);
        } catch (error) {
            console.error(
                "Failed to load canvas tools:",
                error
            );
        }
    }, [canvasId]);


    /*
     * Handle React Flow node changes.
     */
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((currentNodes) =>
                applyNodeChanges(changes, currentNodes)
            );
        },
        []
    );


    /*
     * Persist a tool's position after dragging.
     */
    const handleNodeDragStop = useCallback(
        (
            _event: MouseEvent | TouchEvent,
            node: Node
        ) => {
            const canvasToolId = Number(node.id);

            updateCanvasTool(
                canvasId,
                canvasToolId,
                {
                    x: node.position.x,
                    y: node.position.y,
                }
            ).catch((error) => {
                console.error(
                    "Failed to save tool position:",
                    error
                );
            });
        },
        [canvasId]
    );


    /*
     * Load the canvas and its tools when the canvas changes.
     */
    useEffect(() => {
        async function loadCanvas() {
            try {
                const data = await getCanvas(canvasId);

                setCanvas(data);

                await loadCanvasTools();
            } catch (error) {
                console.error(
                    "Failed to load canvas:",
                    error
                );
            }
        }

        loadCanvas();
    }, [canvasId, loadCanvasTools]);


    /*
     * Track current React Flow zoom level.
     */
    const handleMove = useCallback<OnMove>(
        (_, viewport) => {
            setZoom(viewport.zoom);
        },
        []
    );


    /*
     * Send a prompt to the canvas.
     *
     * If the prompt contains a CanvasAction, the backend
     * may add/remove a CanvasTool. After the request succeeds,
     * reload the tools so React Flow reflects the database state.
     */
    async function handleSendPrompt() {
        const trimmedPrompt = prompt.trim();

        if (!trimmedPrompt || sendingPrompt) {
            return;
        }

        try {
            setSendingPrompt(true);

            const newPrompt = await sendPrompt(
                canvasId,
                trimmedPrompt
            );

            /*
             * Refresh canvas tools after every successful prompt.
             *
             * This ensures:
             * - add_tool appears immediately
             * - remove_tool disappears immediately
             */
            await loadCanvasTools();

            onCanvasUpdated();

            setCanvas((currentCanvas) => {
                if (!currentCanvas) {
                    return currentCanvas;
                }

                return {
                    ...currentCanvas,
                    prompts: [
                        ...currentCanvas.prompts,
                        newPrompt,
                    ],
                };
            });

            setPrompt("");

        } catch (error) {
            console.error(
                "Failed to send prompt:",
                error
            );
        } finally {
            setSendingPrompt(false);
        }
    }


    /*
     * Logout.
     */
    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );
        } finally {
            localStorage.removeItem("loom_token");
            onLogout();
        }
    }


    return (
        <div className="relative h-screen w-screen overflow-hidden">

            {/* Top bar */}
            <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-4">

                <div>
                    <h1 className="text-lg font-semibold">
                        {canvas?.title ?? "Loading canvas..."}
                    </h1>

                    <p className="text-xs text-zinc-400">
                        Canvas ID: {canvasId}
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={onHome}
                        className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                        Home
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                    >
                        Logout
                    </button>

                </div>
            </header>


            {/* Canvas */}
            <div className="h-full w-full pt-[73px]">

                <CanvasProvider refreshCanvasTools={loadCanvasTools}>
                    <ReactFlow
                        nodes={nodes}
                        edges={[]}
                        nodeTypes={{
                            tool: ToolNode,
                        }}
                        onNodesChange={handleNodesChange}
                        onNodeDragStop={handleNodeDragStop}
                        onMove={handleMove}
                        fitView
                        minZoom={0.1}
                        maxZoom={4}
                        panOnDrag
                        zoomOnScroll
                        zoomOnPinch
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </CanvasProvider>

            </div>


            {/* Prompt drawer */}
            <PromptDrawer
                prompts={canvas?.prompts ?? []}
                prompt={prompt}
                onPromptChange={setPrompt}
                onSend={handleSendPrompt}
                sending={sendingPrompt}
                open={promptDrawerOpen}
                onToggle={() => {
                    setPromptDrawerOpen(
                        (current) => !current
                    );
                }}
            />


            {/* Temporary zoom indicator */}
            <div className="absolute bottom-4 right-4 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                Zoom: {Math.round(zoom * 100)}%
            </div>

        </div>
    );
}