const fs = require('fs');
const path = require('path');
const os = require('os');

// Always ensure stdout returns valid JSON for Antigravity
function replySuccess() {
  process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

async function main() {
  try {
    let inputData = '';
    const stdin = process.stdin;
    
    if (!stdin.isTTY) {
      stdin.setEncoding('utf8');
      inputData = await new Promise((resolve) => {
        let data = '';
        const timeout = setTimeout(() => resolve(data), 1500);
        stdin.on('readable', () => {
          let chunk;
          while ((chunk = stdin.read()) !== null) {
            data += chunk;
          }
        });
        stdin.on('end', () => {
          clearTimeout(timeout);
          resolve(data);
        });
        stdin.on('error', () => {
          clearTimeout(timeout);
          resolve(data);
        });
      });
    }

    let payloadObj = {};
    if (inputData.trim()) {
      try {
        payloadObj = JSON.parse(inputData.trim());
      } catch (e) {
        payloadObj = { raw: inputData };
      }
    }

    // Extract prompt from transcript if transcriptPath is provided
    let lastUserPrompt = '';
    let recentToolDetails = null;

    if (payloadObj.transcriptPath && fs.existsSync(payloadObj.transcriptPath)) {
      try {
        const lines = fs.readFileSync(payloadObj.transcriptPath, 'utf8').trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const entry = JSON.parse(lines[i]);
            if (entry.type === 'USER_INPUT' && entry.content && !lastUserPrompt) {
              lastUserPrompt = entry.content;
              break;
            }
          } catch (err) {}
        }
      } catch (err) {}
    }

    // Inspect toolCall if available (from PreToolUse)
    if (payloadObj.toolCall) {
      recentToolDetails = payloadObj.toolCall;
    }

    const apiUrl = process.env.ENGRAM_API || process.env.DEVPRACTICE_API || 'http://localhost:3000';
    const endpoint = apiUrl.replace(/\/$/, '') + '/api/capture';
    const token = process.env.ENGRAM_TOKEN || process.env.DEVPRACTICE_TOKEN || 'engram-capture-secret';
    const userId = process.env.ENGRAM_USER_ID || process.env.DEVPRACTICE_USER_ID || 'e60ef9af-9bbf-4eb9-94be-5a8a2f4669cc';

    let eventType = 'tool_use';
    if (lastUserPrompt) {
      eventType = 'prompt';
    } else if (recentToolDetails?.name?.includes('write') || recentToolDetails?.name?.includes('replace')) {
      eventType = 'file_edit';
    }

    const capturePayload = {
      event_type: eventType,
      tool: 'antigravity',
      payload: {
        prompt: lastUserPrompt || undefined,
        toolCall: recentToolDetails || undefined,
        conversationId: payloadObj.conversationId || undefined,
        stepIdx: payloadObj.stepIdx || undefined,
      },
      session_id: payloadObj.conversationId || 'antigravity-session',
      captured_at: new Date().toISOString()
    };

    // Forward to DevPractice backend asynchronously with a fast timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        },
        body: JSON.stringify(capturePayload),
        signal: controller.signal
      });
    } catch (fetchErr) {
      // Silently fail, don't interrupt workflow
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (e) {
    // Silently ignore
  } finally {
    replySuccess();
    process.exit(0);
  }
}

main();
