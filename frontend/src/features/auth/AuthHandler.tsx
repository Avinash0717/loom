import { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import PromptPage from "../prompt/PromptPage";
import CanvasPage from "../canvas/CanvasPage";
import HistoryDrawer from "../drawers/HistoryDrawer";
import { getCanvases, deleteCanvas, } from "../../services/canvasApi";

import { heartbeat } from "../../services/authApi";

type AuthView = "login" | "register";
type AppView = "prompt" | "canvas";

export default function AuthHandler() {
    const [authenticated, setAuthenticated] = useState(
        () => Boolean(localStorage.getItem("loom_token"))
    );

    const [authView, setAuthView] = useState<AuthView>("login");

    const [canvasId, setCanvasId] = useState<number | null>(() => {
        const storedCanvasId = localStorage.getItem("loom_current_canvas");

        return storedCanvasId ? Number(storedCanvasId) : null;
    });

    const [appView, setAppView] = useState<AppView>(() => {
        const storedCanvasId = localStorage.getItem("loom_current_canvas");

        return storedCanvasId ? "canvas" : "prompt";
    });

    const [canvases, setCanvases] = useState<
        Awaited<ReturnType<typeof getCanvases>>
    >([]);

    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(true);

    useEffect(() => {
        if (!authenticated) {
            return;
        }

        heartbeat().catch((error) => {
            console.error("Heartbeat failed:", error);
        });

        const interval = window.setInterval(() => {
            heartbeat().catch((error) => {
                console.error("Heartbeat failed:", error);
            });
        }, 60_000);

        return () => {
            window.clearInterval(interval);
        };
    }, [authenticated]);

    useEffect(() => {
        if (!authenticated) {
            return;
        }

        async function loadCanvases() {
            try {
                const data = await getCanvases();
                setCanvases(data);
            } catch (error) {
                console.error("Failed to load canvas history:", error);
            }
        }

        loadCanvases();
    }, [authenticated]);

    function handleSelectCanvas(selectedCanvasId: number) {
        localStorage.setItem(
            "loom_current_canvas",
            selectedCanvasId.toString()
        );

        setCanvasId(selectedCanvasId);
        setAppView("canvas");
    }

    async function refreshCanvases() {
        try {
            const data = await getCanvases();
            setCanvases(data);
        } catch (error) {
            console.error("Failed to refresh canvas history:", error);
        }
    }

    async function handleDeleteCanvas(
        deletedCanvasId: number
    ) {
        try {
            await deleteCanvas(deletedCanvasId);

            await refreshCanvases();

            if (deletedCanvasId === canvasId) {
                setCanvasId(null);
                localStorage.removeItem("loom_current_canvas");
                setAppView("prompt");
            }
        } catch (error) {
            console.error("Failed to delete canvas:", error);
        }
    }

    if (authenticated) {
        return (
            <div className="min-h-screen">
                <HistoryDrawer
                    canvases={canvases}
                    currentCanvasId={canvasId}
                    open={historyDrawerOpen}
                    onToggle={() => {
                        setHistoryDrawerOpen((current) => !current);
                    }}
                    onSelectCanvas={handleSelectCanvas}
                    onDeleteCanvas={handleDeleteCanvas}
                />

                {appView === "prompt" ? (
                    <PromptPage
                        onSend={(canvas) => {
                            setCanvasId(canvas.id);

                            localStorage.setItem(
                                "loom_current_canvas",
                                canvas.id.toString()
                            );

                            setAppView("canvas");

                            setCanvases((current) => [
                                canvas,
                                ...current.filter((item) => item.id !== canvas.id),
                            ]);
                        }}
                        onLogout={() => {
                            localStorage.removeItem("loom_current_canvas");
                            setCanvasId(null);
                            setCanvases([]);
                            setAuthenticated(false);
                            setAppView("prompt");
                        }}
                    />
                ) : (
                    <CanvasPage
                        canvasId={canvasId!}
                        onHome={async () => {
                            localStorage.removeItem("loom_current_canvas");
                            setCanvasId(null);
                            setAppView("prompt");
                            await refreshCanvases();
                        }}
                        onLogout={() => {
                            localStorage.removeItem("loom_current_canvas");
                            setCanvasId(null);
                            setCanvases([]);
                            setAuthenticated(false);
                            setAppView("prompt");
                        }}
                        onCanvasUpdated={refreshCanvases}
                    />
                )}
            </div>
        );
    }

    if (authView === "register") {
        return (
            <Register
                onRegistered={(token) => {
                    localStorage.setItem("loom_token", token);
                    setAuthenticated(true);
                    setAppView("prompt");
                }}
                onBackToLogin={() => {
                    setAuthView("login");
                }}
            />
        );
    }

    return (
        <Login
            onLogin={() => {
                setAuthenticated(true);
                setAppView("prompt");
            }}
            onRegister={() => {
                setAuthView("register");
            }}
        />
    );
}