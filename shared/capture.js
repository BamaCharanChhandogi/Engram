const fs = require('fs');
const path = require('path');
const os = require('os');

// Fallback error logging
function logError(message) {
    try {
        const logDir = path.join(os.homedir(), '.engram');
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

function resolveConfig() {
    let token = process.env.ENGRAM_TOKEN || process.env.DEVPRACTICE_TOKEN || '';
    let apiUrl = process.env.ENGRAM_API || process.env.DEVPRACTICE_API || '';

    // 1. Try local .env in current workspace
    if (!token || !apiUrl) {
        try {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const tokenMatch = envContent.match(/ENGRAM_TOKEN=["']?([^"'\r\n]+)["']?/);
                const apiMatch = envContent.match(/ENGRAM_API=["']?([^"'\r\n]+)["']?/);
                if (!token && tokenMatch) token = tokenMatch[1].trim();
                if (!apiUrl && apiMatch) apiUrl = apiMatch[1].trim();
            }
        } catch (e) {}
    }

    // 2. Try global ~/.engram/config.json
    if (!token || !apiUrl) {
        try {
            const globalConfigFile = path.join(os.homedir(), '.engram', 'config.json');
            if (fs.existsSync(globalConfigFile)) {
                const globalData = JSON.parse(fs.readFileSync(globalConfigFile, 'utf8'));
                if (!token && globalData.token) token = globalData.token;
                if (!apiUrl && globalData.api) apiUrl = globalData.api;
            }
        } catch (e) {}
    }

    if (!apiUrl) {
        apiUrl = 'https://engram.bamacharan.com';
    }

    return { token, apiUrl };
}

async function main() {
    try {
        let inputData = '';
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

        const { token, apiUrl } = resolveConfig();
        const endpoint = apiUrl.replace(/\/$/, '') + '/api/capture';

        const capturePayload = {
            event_type: payloadObj.event_type || payloadObj.event || process.env.ENGRAM_EVENT || process.env.DEVPRACTICE_EVENT || 'unknown',
            tool: payloadObj.tool || process.env.ENGRAM_TOOL || process.env.DEVPRACTICE_TOOL || 'unknown',
            payload: payloadObj,
            session_id: process.env.ENGRAM_SESSION || process.env.DEVPRACTICE_SESSION || 'unknown',
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
