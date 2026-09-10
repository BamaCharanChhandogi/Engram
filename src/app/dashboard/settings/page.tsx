'use client';

import { useState } from 'react';

const tools = [
  {
    id: 'claude-code',
    name: 'Claude Code CLI',
    badge: 'Official Plugin',
    desc: 'Hooks into UserPromptSubmit, PostToolUse (Write/Edit/Bash), and Stop lifecycle events.',
    command: 'claude plugin install devpractice',
  },
  {
    id: 'cursor',
    name: 'Cursor IDE',
    badge: 'Workspace Hooks',
    desc: 'Captures beforeSubmitPrompt and afterFileEdit non-blockingly.',
    command: 'npx devpractice init --cursor',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex CLI',
    badge: 'CLI Daemon',
    desc: 'Hooks into SessionStart, UserPromptSubmit, and PostToolUse.',
    command: 'npx devpractice init --codex',
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    badge: 'Adapter Active',
    desc: 'Observes PreToolUse, PostToolUse, and Stop via local adapter.',
    command: 'npx devpractice init --antigravity',
  },
];

export default function SettingsPage() {
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const apiToken = 'devpractice-capture-secret';

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
      <div className="pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Configuration
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Agent Integrations & Secrets</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Connect your local AI coding tools to stream prompts and diffs into your personal active recall queue.
        </p>
      </div>

      {/* Secret Token Section */}
      <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono text-xs">
              Capture Secret Token
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Passed via Authorization Bearer header by your local hooks to verify incoming diff payloads.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type={showToken ? "text" : "password"} 
              value={apiToken}
              readOnly
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md pl-3.5 pr-14 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
            />
            <button 
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer uppercase"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <button 
            onClick={handleCopyToken}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium tracking-tight transition-colors cursor-pointer shrink-0"
          >
            {copiedToken ? 'Copied' : 'Copy Secret'}
          </button>
        </div>
      </div>

      {/* Agents Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <span>Supported Coding Assistants</span>
          <span>4 Connected Engines</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className="p-5 rounded-lg bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-zinc-100">{tool.name}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {tool.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                  {tool.desc}
                </p>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2 font-mono text-xs">
                <code className="px-3 py-1.5 rounded bg-[#09090b] border border-zinc-800 text-zinc-300 text-[11px] select-all">
                  {tool.command}
                </code>
                <button
                  onClick={() => handleCopyCmd(tool.command, tool.id)}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] cursor-pointer shrink-0 transition-colors"
                >
                  {copiedCmd === tool.id ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Env Configuration */}
      <div className="p-5 rounded-lg bg-[#0e0e12] border border-zinc-800 space-y-2 text-xs font-mono">
        <div className="text-zinc-300 font-semibold">// Global Environment Variables</div>
        <p className="text-zinc-400 text-xs font-sans">
          To point hooks from external machines to your DevPractice instance:
        </p>
        <pre className="p-3 rounded bg-[#09090b] text-zinc-300 overflow-x-auto text-[11px] border border-zinc-800/80">
<code>export DEVPRACTICE_API="http://localhost:3000"
export DEVPRACTICE_TOKEN="devpractice-capture-secret"</code>
        </pre>
      </div>
    </div>
  );
}
