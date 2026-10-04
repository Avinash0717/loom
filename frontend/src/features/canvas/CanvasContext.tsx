import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

interface CanvasContextValue {
    refreshCanvasTools: () => Promise<void>;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

interface CanvasProviderProps {
    children: ReactNode;
    refreshCanvasTools: () => Promise<void>;
}

export function CanvasProvider({
    children,
    refreshCanvasTools,
}: CanvasProviderProps) {
    return (
        <CanvasContext.Provider
            value={{ refreshCanvasTools }}
        >
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);

    if (!context) {
        throw new Error(
            "useCanvas must be used inside CanvasProvider"
        );
    }

    return context;
}