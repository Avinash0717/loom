import { useState } from "react";

import type { ToolProps } from "../../tools";
import { useCanvas } from "./../canvas/CanvasContext";
import { deleteCanvasTool } from "../../services/canvasApi";

export default function Inventory({
    canvasId,
    canvasToolId,
}: ToolProps) {
    const { refreshCanvasTools } = useCanvas();
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        try {
            setDeleting(true);

            await deleteCanvasTool(
                canvasId,
                canvasToolId
            );

            await refreshCanvasTools();
        } catch (error) {
            console.error("Failed to delete Tasks tool:", error);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2>Inventory</h2>

            {/* Temporary: confirms the correct CanvasTool instance */}
            <p>Canvas: {canvasId}</p>
            <p>Canvas Tool: {canvasToolId}</p>

            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
            >
                {deleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}