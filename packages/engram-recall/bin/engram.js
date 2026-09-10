#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

function parseFlags() {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      flags[key] = val !== '' ? val : (args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true);
    }
  }
  return flags;
}

const flags = parseFlags();

if (command === 'init') {
  const key = flags.key || flags['api-key'] || process.env.ENGRAM_TOKEN || '';
  const api = flags.api || process.env.ENGRAM_API || 'https://engram.bamacharan.com';
  const targetDir = process.cwd();
  const captureScriptPath = path.resolve(__dirname, '../shared/capture.js').replace(/\\/g, '/');

  console.log('\x1b[38;2;232;200;114m// Engram Active Recall Initializer\x1b[0m');

  // Save global ~/.engram/config.json if key is provided
  if (key) {
    try {
      const globalConfigDir = path.join(os.homedir(), '.engram');
      if (!fs.existsSync(globalConfigDir)) fs.mkdirSync(globalConfigDir, { recursive: true });
      const globalConfigFile = path.join(globalConfigDir, 'config.json');
      fs.writeFileSync(globalConfigFile, JSON.stringify({ token: key, api }, null, 2), 'utf8');
    } catch (e) {}

    // Also append to local .env
    try {
      const envPath = path.join(targetDir, '.env');
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (!envContent.includes('ENGRAM_TOKEN=')) {
        envContent += `\nENGRAM_TOKEN="${key}"\nENGRAM_API="${api}"\n`;
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    } catch (e) {}
  }

  if (flags.codex) {
    const codexDir = path.join(targetDir, '.codex');
    if (!fs.existsSync(codexDir)) fs.mkdirSync(codexDir, { recursive: true });

    const hooksFile = path.join(codexDir, 'hooks.json');
    const hookConfig = {
      hooks: {
        UserPromptSubmit: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        PostToolUse: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        SessionStart: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }],
        Stop: [{ hooks: [{ type: 'command', command: `node "${captureScriptPath}"`, timeout: 5, async: true }] }]
      }
    };

    fs.writeFileSync(hooksFile, JSON.stringify(hookConfig, null, 2), 'utf8');

    console.log(`\x1b[32m✓ Codex hooks configured:\x1b[0m ${hooksFile}`);
    console.log(`\x1b[90mEnsure hooks = true in config.toml to enable background capture.\x1b[0m\n`);
  } else if (flags.cursor) {
    const cursorDir = path.join(targetDir, '.cursor');
    if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });

    const hooksFile = path.join(cursorDir, 'hooks.json');
    const hookConfig = {
      version: '1',
      hooks: {
        afterFileEdit: [{ command: `node "${captureScriptPath}"` }],
        beforeSubmitPrompt: [{ command: `node "${captureScriptPath}"` }]
      }
    };
    fs.writeFileSync(hooksFile, JSON.stringify(hookConfig, null, 2), 'utf8');
    console.log(`\x1b[32m✓ Cursor workspace hooks configured:\x1b[0m ${hooksFile}\n`);
  } else if (flags.antigravity) {
    console.log(`\x1b[32m✓ Google Antigravity observer adapter configured.\x1b[0m\n`);
  } else {
    console.log('Specify an agent flag to initialize:');
    console.log('  npx engram-recall init --codex --key=<YOUR_TOKEN>');
    console.log('  npx engram-recall init --cursor --key=<YOUR_TOKEN>');
    console.log('  npx engram-recall init --antigravity --key=<YOUR_TOKEN>');
  }
} else if (command === 'watch') {
  const targetDir = process.cwd();
  const apiUrl = (process.env.ENGRAM_API || 'https://engram.bamacharan.com').replace(/\/$/, '');
  const token = process.env.ENGRAM_TOKEN || flags.key || '';

  console.log('\x1b[38;2;232;200;114m// Engram Universal Workspace Observer\x1b[0m');
  console.log(`Observing workspace: ${targetDir}`);
  console.log(`Forwarding to: ${apiUrl}/api/capture\n`);

  let debounceTimer = null;
  function captureGitDiff() {
    try {
      const status = execSync('git status --porcelain', { cwd: targetDir, encoding: 'utf8' }).trim();
      if (!status) return;
      const diff = execSync('git diff -U3', { cwd: targetDir, encoding: 'utf8' }).trim();
      const changedFiles = status.split('\n').map(l => l.slice(3).trim()).filter(Boolean);
      if (!changedFiles.length && !diff) return;

      console.log(`[Engram Observer] Changes detected in ${changedFiles.length} file(s). Forwarding diff...`);
      const payload = {
        version: '1.0',
        source: { agent: 'workspace-observer', workspaceRoot: targetDir },
        event_type: 'file_edit',
        tool: 'observer',
        payload: { files: changedFiles, diff: diff.slice(0, 10000) },
        session_id: `session-observer-${new Date().toISOString().slice(0, 10)}`,
        captured_at: new Date().toISOString()
      };
      fetch(`${apiUrl}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      }).then(r => {
        if (r.ok) console.log(`[Engram Observer] Diff recorded successfully (HTTP ${r.status}).`);
      }).catch(err => {
        console.error(`[Engram Observer] Ingestion notice: ${err.message}`);
      });
    } catch (e) {}
  }

  fs.watch(targetDir, { recursive: true }, (event, filename) => {
    if (!filename || filename.includes('.git') || filename.includes('node_modules') || filename.includes('.next')) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(captureGitDiff, 2000);
  });
  console.log('Watching for AI agent edits... Press Ctrl+C to terminate.\n');
} else {
  console.log('\x1b[38;2;232;200;114mEngram Active Recall CLI\x1b[0m');
  console.log('Usage:');
  console.log('  npx engram-recall init --codex --key=<YOUR_TOKEN>');
  console.log('  npx engram-recall init --cursor --key=<YOUR_TOKEN>');
  console.log('  npx engram-recall init --antigravity --key=<YOUR_TOKEN>');
  console.log('  npx engram-recall watch --key=<YOUR_TOKEN>');
}
