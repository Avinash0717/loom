import { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import PromptPage from "../prompt/PromptPage";
import CanvasPage from "../canvas/CanvasPage";

import { heartbeat } from "../../services/authApi";

type AuthView = "login" | "register";
type AppView = "prompt" | "canvas";

export default function AuthHandler() {
    const [authenticated, setAuthenticated] = useState(
        () => Boolean(localStorage.getItem("loom_token"))
    );

    const [authView, setAuthView] = useState<AuthView>("login");

    const [appView, setAppView] = useState<AppView>("prompt");

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

    if (authenticated) {
        if (appView === "canvas") {
            return (
                <CanvasPage
                    onHome={() => {
                        setAppView("prompt");
                    }}
                    onLogout={() => {
                        setAuthenticated(false);
                        setAuthView("login");
                        setAppView("prompt");
                    }}
                />
            );
        }

        return (
            <PromptPage
                onSend={(prompt) => {
                    console.log("Prompt:", prompt);
                    setAppView("canvas");
                }}
                onLogout={() => {
                    setAuthenticated(false);
                    setAuthView("login");
                    setAppView("prompt");
                }}
            />
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