import { useState } from "react";
import type { Workspace } from "../types/workspace";
import { switchWorkspace } from "../services/workspaceApi";
import { api } from "../services/api";

interface MasterControlProps {
    workspaces: Workspace[];
    activeWorkspaceId: string;
    onWorkspaceChanged: () => Promise<void>;
}

export default function MasterControl({
    workspaces,
    activeWorkspaceId,
    onWorkspaceChanged,
}: MasterControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    async function handleWorkspaceSwitch(workspaceId: string) {
        if (workspaceId === activeWorkspaceId || switching) {
            return;
        }

        try {
            setSwitching(true);

            await switchWorkspace(workspaceId);
            await onWorkspaceChanged();
        } catch (error) {
            console.error("Failed to switch workspace:", error);
        } finally {
            setSwitching(false);
        }
    }

    async function handleToolToggle(
        toolId: string,
        enabled: boolean
    ) {
        try {
            await api.put(`/tools/${toolId}`, {
                enabled,
            });

            await onWorkspaceChanged();
        } catch (error) {
            console.error("Failed to update tool:", error);
        }
    }

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-80 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
                    <h2 className="text-lg font-semibold">
                        Master Control
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        Select a workspace
                    </p>

                    <div className="mt-4 space-y-2">
                        {workspaces.map((workspace) => {
                            const isActive =
                                workspace.id === activeWorkspaceId;

                            return (
                                <button
                                    key={workspace.id}
                                    type="button"
                                    disabled={switching}
                                    onClick={() =>
                                        handleWorkspaceSwitch(workspace.id)
                                    }
                                    className={`w-full rounded-lg px-3 py-3 text-left transition ${isActive
                                        ? "bg-zinc-700"
                                        : "bg-zinc-800 hover:bg-zinc-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            {workspace.name}
                                        </span>

                                        {isActive && (
                                            <span className="text-xs text-zinc-400">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-zinc-400">
                                        {workspace.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 border-t border-zinc-800 pt-5">
                        <h3 className="text-sm font-semibold">
                            Tools
                        </h3>

                        <p className="mt-1 text-xs text-zinc-400">
                            Enable or disable tools in this workspace.
                        </p>

                        <div className="mt-3 space-y-2">
                            {workspaces
                                .find((workspace) => workspace.id === activeWorkspaceId)
                                ?.tools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-3"
                                    >
                                        <span className="text-sm">
                                            {tool.id}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToolToggle(
                                                    tool.id,
                                                    !tool.enabled
                                                )
                                            }
                                            className={`rounded-md px-3 py-1 text-xs ${tool.enabled
                                                    ? "bg-green-700"
                                                    : "bg-zinc-700"
                                                }`}
                                        >
                                            {tool.enabled ? "ON" : "OFF"}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xl shadow-xl transition hover:bg-zinc-700"
                aria-label={
                    isOpen
                        ? "Close Master Control"
                        : "Open Master Control"
                }
            >
                {isOpen ? "×" : "◉"}
            </button>
        </>
    );
}