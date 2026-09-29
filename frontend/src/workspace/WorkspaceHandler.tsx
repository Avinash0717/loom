import { useEffect, useState } from "react";
import { getWorkspace } from "../services/workspaceApi";
import type { WorkspaceResponse } from "../types/workspace";
import { toolRegistry } from "./ToolRegistry";
import MasterControl from "./MasterControl";
import { logout } from "../services/authApi";

interface WorkspaceHandlerProps {
  onLogout: () => void;
}

export default function WorkspaceHandler({
  onLogout,
}: WorkspaceHandlerProps) {
  const [workspaceData, setWorkspaceData] =
    useState<WorkspaceResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const data = await getWorkspace();
        setWorkspaceData(data);
      } catch (error) {
        console.error("Failed to load workspace:", error);
        setError("Failed to load workspace.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading workspace...
      </div>
    );
  }

  if (error || !workspaceData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{error ?? "Workspace unavailable."}</p>
      </div>
    );
  }

  const activeWorkspace = workspaceData.activeWorkspace;

  async function reloadWorkspace() {
    try {
      const data = await getWorkspace();
      setWorkspaceData(data);
    } catch (error) {
      console.error("Failed to reload workspace:", error);
      setError("Failed to reload workspace.");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">
            {activeWorkspace.name}
          </h1>

          <p className="text-sm text-zinc-400">
            {activeWorkspace.description}
          </p>
        </div>

        <button
          onClick={async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout failed:", error);
            } finally {
              localStorage.removeItem("loom_token");
              onLogout();
            }
          }}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Logout
        </button>
      </header>

      <main className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeWorkspace.tools
            .filter((tool) => tool.enabled)
            .map((tool) => {
              const ToolComponent =
                toolRegistry[
                tool.id as keyof typeof toolRegistry
                ];

              if (!ToolComponent) {
                return null;
              }

              return (
                <div key={tool.id}>
                  <ToolComponent />
                </div>
              );
            })}
        </div>
      </main>

      <MasterControl
        workspaces={workspaceData.availableWorkspaces}
        activeWorkspaceId={workspaceData.activeWorkspace.id}
        onWorkspaceChanged={reloadWorkspace}
      />
    </div>
  );
}