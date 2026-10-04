import type { FormEvent } from "react";

interface Prompt {
    id: number;
    content: string;
    response: string | null;
    created_at: string;
}

interface PromptDrawerProps {
    prompts: Prompt[];
    prompt: string;
    onPromptChange: (value: string) => void;
    onSend: () => void;
    sending: boolean;
    open: boolean;
    onToggle: () => void;
}

export default function PromptDrawer({
    prompts,
    prompt,
    onPromptChange,
    onSend,
    sending,
    open,
    onToggle,
}: PromptDrawerProps) {
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        onSend();
    }

    return (
        <>
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-20 z-20 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            >
                {open ? "Close Prompt" : "Open Prompt"}
            </button>

            <aside
                className={`absolute right-0 top-[73px] z-10 flex h-[calc(100vh-73px)] w-96 flex-col border-l border-zinc-800 bg-zinc-950 transition-transform ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h2 className="font-semibold">
                        Conversation
                    </h2>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {prompts.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                            No messages yet.
                        </p>
                    ) : (
                        prompts.map((item) => (
                            <div
                                key={item.id}
                                className="space-y-3"
                            >
                                <div>
                                    <p className="mb-1 text-xs text-zinc-500">
                                        You
                                    </p>

                                    <div className="rounded-lg bg-zinc-800 p-3 text-sm">
                                        {item.content}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs text-zinc-500 text-right">
                                        Loom
                                    </p>

                                    <div className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-300">
                                        {item.response ?? "No response yet."}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="border-t border-zinc-800 p-4"
                >
                    <textarea
                        value={prompt}
                        onChange={(event) => {
                            onPromptChange(event.target.value);
                        }}
                        placeholder="Ask Loom..."
                        disabled={sending}
                        className="min-h-24 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={!prompt.trim() || sending}
                        className="mt-2 w-full rounded-lg bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </form>
            </aside>
        </>
    );
}