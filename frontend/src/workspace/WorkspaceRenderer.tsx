import { toolRegistry } from "./ToolRegistry";

interface Props {
  tools: string[];
}

export default function WorkspaceRenderer({ tools }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {tools.map((toolId) => {
        const Tool =
          toolRegistry[
            toolId as keyof typeof toolRegistry
          ];

        if (!Tool) {
          return null;
        }

        return <Tool key={toolId} />;
      })}
    </div>
  );
}