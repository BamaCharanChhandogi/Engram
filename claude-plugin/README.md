# Engram Claude Code Plugin

Intercepts prompts, reasoning, and tool execution diffs to power your personalized Engram cognitive retention profile.

## Installation

1. Copy or symlink this directory into your project root:
   ```bash
   cp -r claude-plugin .claude-plugin
   ```
2. Configure environment variables in your terminal:
   ```bash
   export ENGRAM_TOKEN="your_personal_token"
   export ENGRAM_API="http://localhost:3000" # or your hosted URL
   ```
3. Run `claude` and code normally. All prompts and file diffs are captured asynchronously with 0ms blocking latency.
