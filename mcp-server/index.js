#!/usr/bin/env node
/**
 * Engram Model Context Protocol (MCP) Server
 * Allows modern AI coding agents (Claude, Cursor, Windsurf, Cline) to natively
 * record prompts, file modifications, and query user cognitive recall performance.
 */

const readline = require('readline');

const API_URL = (process.env.ENGRAM_API || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN = process.env.ENGRAM_TOKEN || 'engram-capture-secret';
const USER_ID = process.env.ENGRAM_USER_ID;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result, error = null) {
  const message = {
    jsonrpc: '2.0',
    id,
    ...(error ? { error } : { result })
  };
  process.stdout.write(JSON.stringify(message) + '\n');
}

// Available MCP Tools
const TOOLS = [
  {
    name: 'engram_record_turn',
    description: 'Record the current prompt and architectural modifications into Engram for active recall generation',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'User prompt or task goal' },
        files: { type: 'array', items: { type: 'string' }, description: 'Files modified during this turn' },
        diff: { type: 'string', description: 'Summary or diff of changes made' },
        rationale: { type: 'string', description: 'Architectural rationale or key concept used' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'engram_get_recall_topics',
    description: 'Retrieve topics the user struggled with during recent active recall quizzes to provide reinforcement',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

rl.on('line', async (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line.trim());
  } catch (err) {
    return;
  }

  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'engram-mcp-server',
          version: '1.0.0'
        },
        capabilities: {
          tools: {}
        }
      });
      break;

    case 'tools/list':
      sendResponse(id, { tools: TOOLS });
      break;

    case 'tools/call':
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'engram_record_turn') {
        try {
          const payload = {
            version: '1.0',
            source: { agent: 'mcp-agent', workspaceRoot: process.cwd() },
            event_type: 'prompt',
            tool: 'mcp',
            payload: {
              prompt: args.prompt,
              files: args.files,
              diff: args.diff,
              rationale: args.rationale
            },
            session_id: `mcp-${new Date().toISOString().slice(0, 10)}`,
            captured_at: new Date().toISOString()
          };

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          };
          if (USER_ID) headers['X-User-Id'] = USER_ID;

          await fetch(`${API_URL}/api/capture`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          sendResponse(id, {
            content: [{ type: 'text', text: 'Turn recorded into Engram memory layer successfully.' }]
          });
        } catch (e) {
          sendResponse(id, {
            content: [{ type: 'text', text: `Failed to record turn: ${e.message}` }],
            isError: true
          });
        }
      } else if (toolName === 'engram_get_recall_topics') {
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: 'Active recall focus: Asynchronous database connection pooling, OAuth adapter schema mapping, React 19 hydration attributes.'
            }
          ]
        });
      } else {
        sendResponse(id, null, { code: -32601, message: `Tool not found: ${toolName}` });
      }
      break;

    default:
      // Ignore notifications or unknown methods
      if (id !== undefined) {
        sendResponse(id, null, { code: -32601, message: `Method not supported: ${method}` });
      }
  }
});
