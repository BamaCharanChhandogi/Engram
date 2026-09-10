# DevPractice Codex Hooks

Logs session starts, prompts, tool outputs, and stops.

## Installation
1. Move `hooks.json` to your project directory alongside Codex CLI configurations.
2. In your `config.toml`, make sure hooks are enabled:
   ```toml
   hooks = true
   ```
3. Set your token environment variable in the terminal:
   ```bash
   export DEVPRACTICE_TOKEN="your_token"
   ```
