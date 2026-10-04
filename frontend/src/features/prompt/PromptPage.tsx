import { useState } from "react";
import { logout } from "../../services/authApi";
import { createCanvas } from "../../services/canvasApi";

import type { CanvasResponse } from "../../services/canvasApi";

interface PromptPageProps {
    onSend: (canvas: CanvasResponse) => void;
    onLogout: () => void;
}

export default function PromptPage({
    onSend,
    onLogout,
}: PromptPageProps) {
    const [prompt, setPrompt] = useState("");

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

    async function handleSend() {
        const trimmedPrompt = prompt.trim();

        if (!trimmedPrompt) {
            return;
        }

        try {
            const canvas = await createCanvas(trimmedPrompt);
            onSend(canvas);
        } catch (error) {
            console.error("Failed to create canvas:", error);
        }
    }

    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h1 className="text-xl font-semibold">
                    Loom
                </h1>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                >
                    Logout
                </button>
            </header>

            <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <h2 className="mb-6 text-center text-2xl font-semibold">
                        What do you want to do?
                    </h2>

                    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                        <textarea
                            value={prompt}
                            onChange={(event) => {
                                setPrompt(event.target.value);
                            }}
                            placeholder="Describe what you want to do..."
                            className="min-h-32 w-full resize-none bg-transparent outline-none"
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!prompt.trim()}
                                className="rounded-md bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}