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
        <div className="h-32 bg-[#121215] rounded-lg border border-zinc-800"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-[#121215] rounded-lg border border-zinc-800"></div>)}
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
      <div className="pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            LLM Efficiency Coach
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Prompt Engineering Quality</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Gemini evaluation of clarity, context density, and security risks in your AI prompts.
        </p>
      </div>

      {/* Score Overview Card */}
      <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-zinc-800 bg-[#09090b] shrink-0 font-mono">
          <span className={`text-2xl font-bold ${
            overallScore >= 80 ? 'text-emerald-400' : 
            overallScore >= 50 ? 'text-amber-400' : 
            'text-rose-400'
          }`}>
            {overallScore}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase">Score</span>
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-mono text-xs">
            Prompt Quality Index
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            {overallScore >= 80 
              ? "High prompt precision. Your prompts provide explicit constraints, file contexts, and expected outputs."
              : overallScore >= 50
              ? "Moderate quality. Consider naming exact filepaths and defining explicit return types to reduce AI hallucinations."
              : "Low context density. Prompts contain ambiguous directives, single-word confirmations, or security risks like raw API keys."}
          </p>
        </div>
      </div>

      {/* Prompts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <span>Analyzed Session Prompts</span>
          <span>{prompts.length} reviewed</span>
        </div>

        {prompts.length === 0 ? (
          <div className="text-center py-12 bg-[#121215] rounded-lg border border-zinc-800/80">
            <p className="text-xs text-zinc-500 font-mono">No prompts captured yet. Prompts typed in Claude Code, Cursor, Codex, or Antigravity will be evaluated here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt: any, idx: number) => (
              <div 
                key={idx} 
                className="rounded-lg bg-[#121215] border border-zinc-800/80 overflow-hidden hover:border-zinc-700 transition-colors"
              >
                <div className="px-4 py-3 bg-[#0e0e11] border-b border-zinc-800/80 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Captured Prompt</span>
                    <p className="text-xs font-mono text-zinc-300 line-clamp-2">
                      "{prompt.original}"
                    </p>
                  </div>
                  <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                    (prompt.score || 0) >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    (prompt.score || 0) >= 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {prompt.score || 0}/100
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                    Optimization Guidance
                  </span>
                  {Array.isArray(prompt.suggestions) ? (
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {prompt.suggestions.map((sug: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-zinc-600 font-mono">•</span>
                          <span className="leading-relaxed">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-300 leading-relaxed">{prompt.suggestions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineering Guidelines */}
      <div className="p-5 rounded-lg bg-[#0e0e12] border border-zinc-800 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
          <span>// Best Practices: Writing High-Yield Prompts</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400 pt-1 font-mono">
          {tips.map((tip: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-indigo-400">0{i + 1}.</span>
              <span className="leading-relaxed font-sans">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
