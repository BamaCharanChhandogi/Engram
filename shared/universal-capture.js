const fs = require('fs');
const path = require('path');
const os = require('os');

// Standardized Declarative Adapters
const ADAPTERS = {
  antigravity: (raw, env) => {
    let prompt = '';
    let tool = null;
    let transcriptPath = raw.transcriptPath || '';
    
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      try {
        const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const entry = JSON.parse(lines[i]);
            if (entry.type === 'USER_INPUT' && entry.content) {
              prompt = entry.content;
              break;
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    if (raw.toolCall) {
      tool = raw.toolCall;
    }

    let eventType = prompt ? 'prompt' : (tool ? 'tool_execution' : 'session_boundary');
    return {
      eventType,
      promptText: prompt || undefined,
      toolName: tool?.name || undefined,
      toolArgs: tool?.args || undefined,
      sessionId: raw.conversationId || env.ENGRAM_SESSION || 'antigravity-session',
    };
  },

  cursor: (raw, env) => {
    const prompt = raw.prompt || raw.user_input || '';
    const file = raw.file || raw.filePath || '';
    const eventType = raw.event_type || (prompt ? 'prompt' : (file ? 'file_edit' : 'tool_execution'));
    return {
      eventType,
      promptText: prompt || undefined,
      filesAffected: file ? [file] : undefined,
      sessionId: raw.session_id || env.CURSOR_SESSION_ID || 'cursor-session',
    };
  },

  claude: (raw, env) => {
    const prompt = raw.prompt || raw.query || '';
    return {
      eventType: prompt ? 'prompt' : 'tool_execution',
      promptText: prompt || undefined,
      toolName: raw.tool_name || undefined,
      sessionId: raw.session_id || env.CLAUDE_SESSION_ID || 'claude-session',
    };
  },

  generic: (raw, env) => {
    return {
      eventType: raw.eventType || raw.event_type || 'tool_execution',
      promptText: raw.prompt || raw.promptText || undefined,
      diffPatch: raw.diff || raw.diffPatch || undefined,
      filesAffected: raw.files ? (Array.isArray(raw.files) ? raw.files : [raw.files]) : undefined,
      sessionId: raw.sessionId || env.ENGRAM_SESSION || 'generic-session',
    };
  }
};

function logError(msg) {
  try {
    const logDir = path.join(os.homedir(), '.engram');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'error.log'), `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

async function main() {
  // Always return allow for Google Antigravity hooks
  if (process.argv.includes('--agent=antigravity') || process.argv.includes('--agent=agy')) {
    try {
      process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
    } catch (e) {}
  }

  // Parse target agent from flags or env
  let agentName = 'generic';
  for (const arg of process.argv) {
    if (arg.startsWith('--agent=')) {
      agentName = arg.split('=')[1].toLowerCase();
    }
  }
  if (agentName === 'generic' && process.env.ENGRAM_AGENT) {
    agentName = process.env.ENGRAM_AGENT.toLowerCase();
  }

  // Read stdin with 1500ms safety timeout
  let inputData = '';
  if (!process.stdin.isTTY) {
    process.stdin.setEncoding('utf8');
    inputData = await new Promise((resolve) => {
      let data = '';
      const timer = setTimeout(() => resolve(data), 1500);
      process.stdin.on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
          data += chunk;
        }
      });
      process.stdin.on('end', () => {
        clearTimeout(timer);
        resolve(data);
      });
      process.stdin.on('error', () => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  let rawPayload = {};
  if (inputData.trim()) {
    try {
      rawPayload = JSON.parse(inputData.trim());
    } catch (e) {
      rawPayload = { raw: inputData.trim() };
    }
  }

  // Execute normalizer adapter
  const adapter = ADAPTERS[agentName] || ADAPTERS.generic;
  const normalized = adapter(rawPayload, process.env);

  const eventPayload = {
    version: '1.0',
    source: {
      agent: agentName,
      workspaceRoot: process.cwd(),
    },
    event_type: normalized.eventType || 'tool_execution',
    tool: agentName,
    payload: {
      prompt: normalized.promptText,
      toolCall: normalized.toolName ? { name: normalized.toolName, args: normalized.toolArgs } : undefined,
      diff: normalized.diffPatch,
      files: normalized.filesAffected,
      raw: Object.keys(rawPayload).length > 0 ? rawPayload : undefined
    },
    session_id: normalized.sessionId,
    captured_at: new Date().toISOString()
  };

  const apiUrl = (process.env.ENGRAM_API || process.env.DEVPRACTICE_API || 'http://localhost:3000').replace(/\/$/, '');
  const endpoint = `${apiUrl}/api/capture`;
  const token = process.env.ENGRAM_TOKEN || process.env.DEVPRACTICE_TOKEN || 'engram-capture-secret';
  const userId = process.env.ENGRAM_USER_ID || process.env.DEVPRACTICE_USER_ID;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventPayload),
      signal: controller.signal
    });
  } catch (err) {
    logError(`Capture dispatch failed: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
    process.exit(0);
  }
}

main();
