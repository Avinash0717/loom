import { useState } from "react";
import type { SubmitEvent } from "react";

import { login } from "../../services/authApi";

import { Eye, EyeOff } from "lucide-react";

interface Props {
    onLogin: () => void;
    onRegister: () => void;
}

export default function Login({ onLogin, onRegister }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const response = await login(email, password);

            localStorage.setItem("loom_token", response.token);

            onLogin();
        } catch (err) {
            console.error(err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Project Loom</h1>
                    <p className="mt-2 text-zinc-400">
                        Sign in to your workspace
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-zinc-300">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none focus:border-zinc-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 pr-12 outline-none focus:border-zinc-500"
                            placeholder="••••••••"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <button
                        type="button"
                        onClick={onRegister}
                        className="w-full text-sm text-zinc-400 hover:text-white"
                    >
                        Don't have an account? Create one
                    </button>
                </div>
            </form>
        </main>
    );
}