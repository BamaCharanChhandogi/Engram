# Engram Cursor Hooks

Captures prompts and AI tool executions to turn your daily coding sessions into a personalized active recall training regimen.

## Installation

1. Copy or symlink the `.cursor` directory into your project root:
   ```bash
   cp -r cursor-hooks/.cursor .cursor
   ```
2. In Cursor's terminal or project settings, configure:
   ```bash
   export ENGRAM_TOKEN="your_token_here"
   export ENGRAM_API="http://localhost:3000" # or your hosted URL
   ```
3. Use Cursor normally; hooks are fully detached and never block your editor.
