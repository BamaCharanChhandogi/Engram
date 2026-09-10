# Engram MCP Server

Model Context Protocol (MCP) server for bidirectional cognitive retention integration.

## Installation in Any MCP-Compatible AI Agent

Add to your MCP configuration (e.g. `claude_desktop_config.json`, `.cursor/mcp.json`, or Windsurf settings):

```json
{
  "mcpServers": {
    "engram": {
      "command": "node",
      "args": ["path/to/devpractice/mcp-server/index.js"],
      "env": {
        "ENGRAM_API": "http://localhost:3000",
        "ENGRAM_TOKEN": "engram-capture-secret"
      }
    }
  }
}
```

## Supported Tools
- `engram_record_turn`: Silently logs agent turns, prompts, and diffs to Engram.
- `engram_get_recall_topics`: Queries the user's active recall focus areas so the agent can provide targeted reinforcement during coding.
