import { useCallback, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    type OnMove,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { logout } from "../../services/authApi";

interface CanvasPageProps {
    onHome: () => void;
    onLogout: () => void;
}

export default function CanvasPage({
    onHome,
    onLogout,
}: CanvasPageProps) {
    const [zoom, setZoom] = useState(1);

    const handleMove = useCallback<OnMove>((_, viewport) => {
        setZoom(viewport.zoom);
    }, []);

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
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
                        Loom Canvas
                    </h1>
                    <p className="text-xs text-zinc-400">
                        Workspace
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
                <ReactFlow
                    nodes={[]}
                    edges={[]}
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
            </div>

            {/* Temporary zoom indicator */}
            <div className="absolute bottom-4 right-4 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
                Zoom: {Math.round(zoom * 100)}%
            </div>
        </div>
    );
}