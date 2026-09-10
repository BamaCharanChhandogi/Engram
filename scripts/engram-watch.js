#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const apiUrl = (process.env.ENGRAM_API || 'http://localhost:3000').replace(/\/$/, '');
const token = process.env.ENGRAM_TOKEN || 'engram-capture-secret';
const userId = process.env.ENGRAM_USER_ID;

console.log(`\x1b[36m// Engram Universal Workspace Observer\x1b[0m`);
console.log(`Observing workspace: \x1b[32m${targetDir}\x1b[0m`);
console.log(`Forwarding to: \x1b[34m${apiUrl}/api/capture\x1b[0m\n`);

let debounceTimer = null;
const DEBOUNCE_MS = 2500;

function captureGitDiff() {
  try {
    const status = execSync('git status --porcelain', { cwd: targetDir, encoding: 'utf8' }).trim();
    if (!status) return;

    const diff = execSync('git diff -U3', { cwd: targetDir, encoding: 'utf8' }).trim();
    const changedFiles = status.split('\n').map(line => line.slice(3).trim()).filter(Boolean);

    if (!changedFiles.length && !diff) return;

    console.log(`\x1b[33m[Engram Observer]\x1b[0m Detected modifications in ${changedFiles.length} file(s). Forwarding diff...`);

    const payload = {
      version: '1.0',
      source: {
        agent: 'workspace-observer',
        workspaceRoot: targetDir,
      },
      event_type: 'file_edit',
      tool: 'observer',
      payload: {
        files: changedFiles,
        diff: diff.slice(0, 10000), // Cap at 10kb
      },
      session_id: `session-observer-${new Date().toISOString().slice(0, 10)}`,
      captured_at: new Date().toISOString()
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    if (userId) headers['X-User-Id'] = userId;

    fetch(`${apiUrl}/api/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.ok) {
        console.log(`\x1b[32m[Engram Observer]\x1b[0m Diff captured successfully (Status: ${res.status}).`);
      } else {
        console.error(`\x1b[31m[Engram Observer]\x1b[0m Capture rejected: HTTP ${res.status}`);
      }
    }).catch(err => {
      console.error(`\x1b[31m[Engram Observer]\x1b[0m Ingestion failed: ${err.message}`);
    });
  } catch (err) {
    // If not a git repo, ignore silently
  }
}

// Watch directory recursively (excluding node_modules and .git)
try {
  fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes('.git') || filename.includes('node_modules') || filename.includes('.next')) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      captureGitDiff();
    }, DEBOUNCE_MS);
  });

  console.log(`Watching for AI agent edits... Press Ctrl+C to terminate.\n`);
} catch (e) {
  console.error(`Failed to watch directory: ${e.message}`);
}
