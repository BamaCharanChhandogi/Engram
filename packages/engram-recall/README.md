# engram-recall

> Active recall layer for modern AI coding agents (OpenAI Codex, Cursor IDE, Claude Code, Google Antigravity).

`engram-recall` captures your daily coding diffs and prompts in the background, transforming passive AI generation into active recall practice to bridge the gap from junior execution to senior engineering.

## Quick Start

Initialize hooks for your preferred coding agent:

### OpenAI Codex CLI
```bash
npx engram-recall init --codex --key=<YOUR_ENGRAM_TOKEN>
```

### Cursor IDE
```bash
npx engram-recall init --cursor --key=<YOUR_ENGRAM_TOKEN>
```

### Google Antigravity
```bash
npx engram-recall init --antigravity --key=<YOUR_ENGRAM_TOKEN>
```

### Universal Workspace Observer Daemon
Works with any editor or terminal:
```bash
npx engram-recall watch --key=<YOUR_ENGRAM_TOKEN>
```

## Security & Privacy
- **Zero blocking**: Ingestion runs detached in the background without adding latency to your agent or IDE.
- **Redaction**: Secret patterns and sensitive tokens are scrubbed before transmission.

## License
MIT
