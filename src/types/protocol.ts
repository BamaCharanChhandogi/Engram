export interface EngramIngestionEvent {
  version: "1.0";
  source: {
    agent: string;          // "antigravity" | "cursor" | "claude" | "codex" | "windsurf" | "observer" | "mcp"
    version?: string;
    workspaceRoot?: string;
  };
  eventType: "prompt" | "file_edit" | "tool_execution" | "session_boundary";
  data: {
    promptText?: string;
    filesAffected?: string[];
    diffPatch?: string;
    toolName?: string;
    toolArgs?: Record<string, unknown>;
    rawInput?: string;
  };
  sessionId: string;
  timestamp: string;
}
