import { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import WorkspaceHandler from "../../workspace/WorkspaceHandler";

import { heartbeat } from "../../services/authApi";

type AuthView = "login" | "register";

export default function AuthHandler() {
    const [authenticated, setAuthenticated] = useState(
        () => Boolean(localStorage.getItem("loom_token"))
    );

    const [authView, setAuthView] = useState<AuthView>("login");

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
        return (
            <WorkspaceHandler
                onLogout={() => {
                    setAuthenticated(false);
                    setAuthView("login");
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
            }}
            onRegister={() => {
                setAuthView("register");
            }}
        />
    );
}