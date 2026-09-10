'use client';

import { useState } from 'react';

type QuestionType = 'comprehension' | 'debugging' | 'interview' | 'prompt_review' | 'code_comprehension';
type Difficulty = 'easy' | 'medium' | 'hard';

interface QuestionCardProps {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  codeContext?: string;
  agentSource?: string;
  onAnswered?: () => void;
}

const typeStyles: Record<string, { label: string; dot: string }> = {
  comprehension: { label: 'Comprehension', dot: 'bg-[var(--accent)]' },
  code_comprehension: { label: 'Comprehension', dot: 'bg-[var(--accent)]' },
  debugging: { label: 'Debugging', dot: 'bg-amber-400' },
  interview: { label: 'System Design', dot: 'bg-purple-400' },
  prompt_review: { label: 'Prompt Review', dot: 'bg-emerald-400' },
};

const diffStyles: Record<string, { label: string; dot: string }> = {
  easy: { label: 'Easy', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', dot: 'bg-amber-400' },
  hard: { label: 'Hard', dot: 'bg-rose-400' },
};

export default function QuestionCard({ id, type, difficulty, question, codeContext, agentSource, onAnswered }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/practice/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: id,
          answerText: answer.trim(),
        }),
      });

      if (res.ok) {
        const evalData = await res.json();
        setEvaluation(evalData);
        if (onAnswered) {
          onAnswered();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.message || 'Failed to submit response.');
      }
    } catch (error) {
      console.error('Answer submit error:', error);
      setErrorMessage('Network error while evaluating answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentType = typeStyles[type] || typeStyles.comprehension;
  const currentDiff = diffStyles[difficulty] || diffStyles.medium;
  const correctItems = evaluation?.correct_parts || evaluation?.correctParts || [];
  const gapItems = evaluation?.gaps || [];

  return (
    <article id={`question-${id}`} className="scroll-mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--border-focus)]">
      <div>
        {/* Card Header & Badges */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal text-zinc-300 bg-white/[0.04] border border-white/[0.08]">
              <span className={`w-1.5 h-1.5 rounded-full ${currentType.dot}`} />
              <span>{currentType.label}</span>
            </span>

            {/* Difficulty Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal text-zinc-300 bg-white/[0.04] border border-white/[0.08]">
              <span className={`w-1.5 h-1.5 rounded-full ${currentDiff.dot}`} />
              <span>{currentDiff.label}</span>
            </span>

            {/* Agent Badge */}
            {agentSource && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal text-zinc-400 bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[var(--accent)] font-semibold text-[11px]">⚡</span>
                <span>
                  {agentSource === 'claude-code' ? 'Claude Code' :
                   agentSource === 'cursor' ? 'Cursor IDE' :
                   agentSource === 'antigravity' ? 'Antigravity' :
                   agentSource === 'codex' ? 'Codex CLI' :
                   agentSource}
                </span>
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">#{id.slice(0, 6)}</span>
        </div>

        {/* Question Title */}
        <h3 className="text-base font-normal text-[var(--text-primary)] leading-relaxed mb-4">
          {question}
        </h3>
        
        {/* Code Diff Block */}
        {codeContext && (
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden">
            <div className="px-3.5 py-1.5 border-b border-[var(--border)] bg-[var(--bg-surface-hover)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span>source_context.ts</span>
              <span className="text-[var(--text-tertiary)]">session diff</span>
            </div>
            <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-[var(--text-primary)]">
              <pre><code>{codeContext}</code></pre>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs">
            {errorMessage}
          </div>
        )}

        {/* Action / Answer State */}
        {!isExpanded && !evaluation ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
          >
            <span>Draft technical response</span>
            <span className="text-zinc-500">Answer ↓</span>
          </button>
        ) : !evaluation ? (
          <div className="space-y-3 mt-4 animate-in fade-in duration-150">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder="State the underlying architectural reason, describe missing guards, or propose the exact code fix..."
              className="w-full h-32 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3.5 text-[var(--text-primary)] text-sm font-sans leading-relaxed focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 resize-y"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border)] text-[var(--text-secondary)]">Ctrl+Enter</kbd> to submit
              </span>
              <div className="flex gap-2.5 ml-auto">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answer.trim()}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[#050505] rounded-full text-sm font-semibold tracking-tight transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    'Submit assessment'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Evaluation Output */
          <div className="mt-5 border-t border-[var(--border)] pt-5 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1 rounded-full text-sm font-mono font-bold border ${
                  evaluation.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  evaluation.score >= 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {evaluation.score} / 100
                </div>
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
                  Tech Lead Review
                </span>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">Evaluated via Gemini</span>
            </div>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed border-l-2 border-[var(--border-focus)] pl-3.5 py-0.5">
              {evaluation.feedback}
            </p>

            {evaluation.levelUpTip && (
              <div className="p-3.5 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--accent)] space-y-1">
                <span className="font-semibold uppercase tracking-wider block text-[10px]">
                  Target Level Calibration Tip:
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  {evaluation.levelUpTip}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {correctItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified Strengths
                  </div>
                  <ul className="space-y-1 text-sm text-[var(--text-primary)]">
                    {correctItems.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-mono font-bold">+</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {gapItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                  <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Nuances & Edge Cases
                  </div>
                  <ul className="space-y-1 text-sm text-[var(--text-primary)]">
                    {gapItems.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-mono font-bold">-</span>
                        <span className="leading-snug">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
