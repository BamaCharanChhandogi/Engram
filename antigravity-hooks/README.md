# Engram Antigravity Hooks

Intercepts user prompts and tool calls inside Google Antigravity to silently feed your cognitive retention dataset.

## How It Works

Google Antigravity invokes lifecycle hooks (`PreToolUse`, `UserPromptSubmit`, etc.) defined in your workspace configuration or `.gemini/antigravity/hooks.json`.

`capture.js` intercepts each turn, extracts the active prompt or file modification diff, and forwards it to Engram's `/api/capture` endpoint asynchronously with a 2-second timeout and 0ms blocking latency.

## Installation

Add the hook entry to your global or project Antigravity config (`~/.gemini/antigravity/hooks.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "node path/to/antigravity-hooks/capture.js"
      }
    ]
  }
}
```

### Environment Variables

Configure your API endpoint and authentication token:

```bash
export ENGRAM_TOKEN="your_personal_token"
export ENGRAM_API="http://localhost:3000" # or your hosted instance
```
