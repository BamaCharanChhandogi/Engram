'use client';

import { useState, useEffect } from 'react';

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('/api/feedback/prompts');
        if (res.ok) {
          const data = await res.json();
          setFeedback(data);
        }
      } catch (err) {
        console.error('Failed to load prompt feedback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]"></div>)}
        </div>
      </div>
    );
  }

  const overallScore = feedback?.overallScore ?? 0;
  const prompts = feedback?.prompts || [];
  const tips = feedback?.tips || [
    'State constraints upfront: e.g. "Use TypeScript without any or type assertions"',
    'Name exact files and signatures: Avoid saying "fix this function"',
    'Isolate requests: Never chain a bugfix and feature request in the same prompt',
    'Never expose raw API keys or database connection strings in prompts'
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-mono">
            Prompt Hygiene & Security
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">Prompt Context Density</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Automated linting for context precision, constraint boundaries, and credential exposure in IDE prompts.
        </p>
      </div>

      {/* Score Overview Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border border-white/[0.08] bg-white/[0.02] shadow-inner shrink-0">
            <span className={`font-serif text-3xl font-normal ${
              overallScore >= 80 ? 'text-emerald-400' : 
              overallScore >= 50 ? 'text-amber-400' : 
              'text-rose-400'
            }`}>
              {overallScore}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">INDEX</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Context Density Score
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              {overallScore >= 80 
                ? "Explicit constraints, targeted filepaths, and concrete return type contracts detected."
                : overallScore >= 50
                ? "Moderate quality. Specify exact filepaths and typed interfaces to prevent AI hallucination."
                : "Ambiguous directives detected. Avoid one-line fixes without boundary constraints."}
            </p>
          </div>
        </div>

        {/* 3 Sub-pills */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-center">
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Constraints</span>
            <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">Explicit</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-center">
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Signatures</span>
            <span className="text-xs font-semibold text-zinc-300 mt-0.5 block">Typed</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-center">
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Redaction</span>
            <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">0 Secrets</span>
          </div>
        </div>
      </div>

      {/* Prompts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
          <span>Analyzed Session Prompts</span>
          <span>{prompts.length} reviewed</span>
        </div>

        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">No prompts captured yet. Prompts typed in Claude Code, Cursor, Codex, or Antigravity will be evaluated here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt: any, idx: number) => (
              <div 
                key={idx} 
                className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden hover:border-[var(--border-focus)] transition-colors"
              >
                <div className="px-5 py-3.5 bg-[var(--bg-surface-hover)] border-b border-[var(--border)] flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium block">Captured Prompt</span>
                    <p className="text-sm font-mono text-[var(--text-primary)] line-clamp-2">
                      "{prompt.original}"
                    </p>
                  </div>
                  <div className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    (prompt.score || 0) >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    (prompt.score || 0) >= 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {prompt.score || 0}/100
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold block">
                    Optimization Guidance
                  </span>
                  {Array.isArray(prompt.suggestions) ? (
                    <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                      {prompt.suggestions.map((sug: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[var(--text-tertiary)] font-mono">•</span>
                          <span className="leading-relaxed">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{prompt.suggestions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineering Guidelines */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-semibold flex items-center gap-2">
          <span>Best Practices: High-Yield Prompting</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--text-secondary)] pt-1">
          {tips.map((tip: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[var(--accent)] font-mono font-medium">0{i + 1}.</span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
