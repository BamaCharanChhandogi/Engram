'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [apiToken, setApiToken] = useState<string>('Loading personal key...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.apiKey) {
            setApiToken(data.apiKey);
          }
        }
      } catch (err) {
        console.error('Failed to load API key:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKey();
  }, []);

  const tools = [
    {
      id: 'codex',
      name: 'OpenAI Codex CLI',
      badge: 'CLI Daemon',
      desc: 'Hooks into SessionStart, UserPromptSubmit, and PostToolUse lifecycle events.',
      command: `npx engram-recall init --codex --key=${apiToken}`,
    },
    {
      id: 'cursor',
      name: 'Cursor IDE',
      badge: 'Workspace Hooks',
      desc: 'Captures beforeSubmitPrompt and afterFileEdit non-blockingly.',
      command: `npx engram-recall init --cursor --key=${apiToken}`,
    },
    {
      id: 'antigravity',
      name: 'Google Antigravity',
      badge: 'Adapter Active',
      desc: 'Observes PreToolUse, PostToolUse, and Stop via local adapter.',
      command: `npx engram-recall init --antigravity --key=${apiToken}`,
    },
    {
      id: 'claude-code',
      name: 'Claude Code CLI',
      badge: 'Official Plugin',
      desc: 'Hooks into UserPromptSubmit, PostToolUse (Write/Edit/Bash), and Stop lifecycle events.',
      command: `claude plugin install engram --api-key=${apiToken}`,
    },
  ];

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCmd = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Account Ingestion Credentials
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Agent Integrations & Personal Secrets
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Your unique ingestion token links Claude Code, Cursor, and Antigravity directly to your personal Engram account.
        </p>
      </div>

      {/* Secret Token Section */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Personal Ingestion Key
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Passed via Authorization Bearer header by your local CLI/IDE hooks to route diffs to your account.
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Unique Account Key
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input 
              type={showToken ? "text" : "password"} 
              value={apiToken}
              readOnly
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-full pl-4 pr-16 py-2.5 text-sm font-mono text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] transition-colors select-all"
            />
            <button 
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <button 
            onClick={handleCopyToken}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#050505] rounded-full text-sm font-semibold tracking-tight transition-colors cursor-pointer shrink-0 shadow-xs disabled:opacity-50"
          >
            {copiedToken ? 'Copied' : 'Copy Key'}
          </button>
        </div>
      </div>

      {/* 1-Click Install Commands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
          <span>1-Step Pre-Filled Install Commands</span>
          <span>Auto-Configured With Your Key</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{tool.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] font-medium">
                    {tool.badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
                  {tool.desc}
                </p>
              </div>

              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-mono text-xs">
                <code className="px-3.5 py-2 rounded-xl sm:rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-xs select-all overflow-x-auto whitespace-nowrap sm:max-w-md">
                  {tool.command}
                </code>
                <button
                  onClick={() => handleCopyCmd(tool.command, tool.id)}
                  className="px-4 py-2 rounded-full bg-[var(--bg-surface-hover)] hover:bg-[var(--border-focus)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-medium cursor-pointer shrink-0 transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedCmd === tool.id ? (
                    <span className="text-[var(--accent)] font-semibold">✓ Copied</span>
                  ) : (
                    <span>Copy Command</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Env Configuration */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
        <div className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-semibold">Global Environment Variables (Optional)</div>
        <p className="text-sm text-[var(--text-secondary)]">
          If you prefer manual shell export in your <code>~/.zshrc</code> or <code>~/.bashrc</code>:
        </p>
        <pre className="p-3.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-auto text-xs font-mono border border-[var(--border)] leading-relaxed">
<code>export ENGRAM_API="https://engram.bamacharan.com"
export ENGRAM_TOKEN="{apiToken}"</code>
        </pre>
      </div>
    </div>
  );
}
