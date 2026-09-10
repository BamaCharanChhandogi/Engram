# Engram Codex Hooks

Intercepts prompts, diffs, and session executions from OpenAI Codex CLI.

## Installation

1. Copy `hooks.json` to your project directory or global Codex config:
   ```bash
   cp codex-hooks/hooks.json .codex/hooks.json
   ```
2. In your `config.toml`, ensure hooks are enabled:
   ```toml
   hooks = true
   ```
3. Set your token and API variables:
   ```bash
   export ENGRAM_TOKEN="your_token_here"
   export ENGRAM_API="http://localhost:3000"
   ```
