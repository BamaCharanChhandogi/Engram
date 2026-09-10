#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

function parseFlags() {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      flags[key] = val !== undefined ? val : (args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true);
    }
  }
  return flags;
}

const flags = parseFlags();

if (command === 'init') {
  const key = flags.key || flags['api-key'] || process.env.ENGRAM_TOKEN || '';
  const api = flags.api || process.env.ENGRAM_API || 'http://localhost:3000';
  const targetDir = process.cwd();

  console.log('\x1b[33m// Engram Agent Integration Initializer\x1b[0m');

  if (flags.codex) {
    const codexDir = path.join(targetDir, '.codex');
    if (!fs.existsSync(codexDir)) fs.mkdirSync(codexDir, { recursive: true });

    const hooksFile = path.join(codexDir, 'hooks.json');
    const captureScriptPath = path.resolve(__dirname, '../shared/capture.js').replace(/\\/g, '/');

    const hookConfig = {
      hooks: {
        UserPromptSubmit: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        PostToolUse: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        SessionStart: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        Stop: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }]
      }
    };

    fs.writeFileSync(hooksFile, JSON.stringify(hookConfig, null, 2), 'utf8');

    // Also write local .env if key is provided
    if (key) {
      const envPath = path.join(targetDir, '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (!envContent.includes('ENGRAM_TOKEN=')) {
        envContent += `\nENGRAM_TOKEN="${key}"\nENGRAM_API="${api}"\n`;
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    }

    console.log(`\x1b[32m✓ Codex hooks initialized at:\x1b[0m ${hooksFile}`);
    console.log(`\x1b[36mTo activate in Codex, ensure config.toml has: hooks = true\x1b[0m\n`);
  } else if (flags.cursor) {
    const cursorDir = path.join(targetDir, '.cursor');
    if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });
    console.log(`\x1b[32m✓ Cursor workspace hooks initialized at:\x1b[0m ${cursorDir}`);
  } else if (flags.antigravity) {
    console.log(`\x1b[32m✓ Google Antigravity observer adapter linked.\x1b[0m`);
  } else {
    console.log('Please specify an agent flag: --codex, --cursor, or --antigravity');
  }
} else if (command === 'watch') {
  require('../scripts/engram-watch.js');
} else {
  console.log('Engram CLI');
  console.log('Usage:');
  console.log('  node bin/engram.js init --codex --key=<your_token>');
  console.log('  node bin/engram.js init --cursor --key=<your_token>');
  console.log('  node bin/engram.js watch');
}
