import type { CanvasResponse } from "../../services/canvasApi";

interface HistoryDrawerProps {
    canvases: CanvasResponse[];
    currentCanvasId: number | null;
    open: boolean;
    onToggle: () => void;
    onSelectCanvas: (canvasId: number) => void;
    onDeleteCanvas: (canvasId: number) => void;
}

export default function HistoryDrawer({
    canvases,
    currentCanvasId,
    open,
    onToggle,
    onSelectCanvas,
    onDeleteCanvas,
}: HistoryDrawerProps) {
    return (
        <>
            <button
                type="button"
                onClick={onToggle}
                className="absolute left-4 top-20 z-20 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            >
                {open ? "Close History" : "Open History"}
            </button>

            <aside
                className={`absolute left-0 top-[73px] z-10 flex h-[calc(100vh-73px)] w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h2 className="font-semibold">
                        Canvas History
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {canvases.length === 0 ? (
                        <p className="p-2 text-sm text-zinc-500">
                            No canvases yet.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {canvases.map((canvas) => (
                                <div
                                    key={canvas.id}
                                    className={`flex items-center rounded-md ${
                                        currentCanvasId === canvas.id
                                            ? "bg-zinc-800"
                                            : ""
                                    } hover:bg-zinc-800`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelectCanvas(canvas.id);
                                        }}
                                        className="min-w-0 flex-1 px-3 py-3 text-left text-sm"
                                    >
                                        <p className="font-medium">
                                            {canvas.title}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Updated{" "}
                                            {new Date(
                                                canvas.updated_at
                                            ).toLocaleString()}
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDeleteCanvas(canvas.id);
                                        }}
                                        className="mr-2 shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-700 hover:text-red-400"
                                        aria-label={`Delete ${canvas.title}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}