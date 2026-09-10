const fs = require('fs');
const path = require('path');
const os = require('os');

// Fallback error logging
function logError(message) {
    try {
        const logDir = path.join(os.homedir(), '.devpractice');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logFile = path.join(logDir, 'error.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        // Silently fail if we can't write to log
    }
}

async function main() {
    try {
        let inputData = '';
        // Read from stdin with a timeout
        const stdin = process.stdin;
        if (!stdin.isTTY) {
            stdin.setEncoding('utf8');
            inputData = await new Promise((resolve) => {
                let data = '';
                const timeout = setTimeout(() => resolve(data), 2000);
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

        let payloadStr = inputData.trim();
        let payloadObj = {};
        if (payloadStr) {
            try {
                payloadObj = JSON.parse(payloadStr);
            } catch (e) {
                logError('Failed to parse stdin as JSON: ' + e.message);
                payloadObj = { raw: payloadStr };
            }
        }

        const apiUrl = process.env.DEVPRACTICE_API || 'http://localhost:3000';
        const endpoint = apiUrl.replace(/\/$/, '') + '/api/capture';
        const token = process.env.DEVPRACTICE_TOKEN || '';

        const capturePayload = {
            event_type: payloadObj.event_type || payloadObj.event || process.env.DEVPRACTICE_EVENT || 'unknown',
            tool: payloadObj.tool || process.env.DEVPRACTICE_TOOL || 'unknown',
            payload: payloadObj,
            session_id: process.env.DEVPRACTICE_SESSION || 'unknown',
            captured_at: new Date().toISOString()
        };

        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(capturePayload),
                signal: controller.signal
            });
        } catch (fetchError) {
            logError('Fetch failed: ' + fetchError.message);
        } finally {
            clearTimeout(timeoutId);
        }

    } catch (e) {
        logError('Unexpected error: ' + e.message);
    } finally {
        process.exit(0);
    }
}

main();
