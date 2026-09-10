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
  onAnswered?: () => void;
}

const typeStyles: Record<string, { label: string; badge: string }> = {
  comprehension: { label: 'COMPREHENSION', badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  code_comprehension: { label: 'COMPREHENSION', badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  debugging: { label: 'DEBUGGING', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  interview: { label: 'SYSTEM DESIGN', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  prompt_review: { label: 'PROMPT REVIEW', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const diffStyles: Record<string, string> = {
  easy: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  medium: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  hard: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
};

export default function QuestionCard({ id, type, difficulty, question, codeContext, onAnswered }: QuestionCardProps) {
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
        setErrorMessage(err.message || 'Evaluation request failed. Please retry.');
      }
    } catch (e: any) {
      console.error('Answer evaluation error:', e);
      setErrorMessage('Network timeout. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentType = typeStyles[type] || typeStyles.comprehension;
  const currentDiff = diffStyles[difficulty] || diffStyles.medium;
  const correctItems = evaluation?.correct_parts || evaluation?.correctParts || [];
  const gapItems = evaluation?.gaps || [];

  return (
    <article className="bg-[#121215] border border-zinc-800/80 rounded-lg overflow-hidden shadow-xs hover:border-zinc-700/80 transition-all duration-150">
      <div className="p-5 md:p-6">
        {/* Top Badges */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase">
            <span className={`px-2 py-0.5 rounded border font-medium ${currentType.badge}`}>
              {currentType.label}
            </span>
            <span className={`px-2 py-0.5 rounded border font-medium ${currentDiff}`}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">ID: {id.slice(0, 8)}</span>
        </div>

        {/* Question Title */}
        <h3 className="text-base md:text-lg font-medium text-zinc-100 leading-relaxed mb-4">
          {question}
        </h3>
        
        {/* Code Diff Block */}
        {codeContext && (
          <div className="mb-5 rounded-md border border-zinc-800 bg-[#0a0a0c] overflow-hidden">
            <div className="px-3.5 py-1.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>source_context.ts</span>
              <span className="text-zinc-600">session diff</span>
            </div>
            <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-zinc-300">
              <pre><code>{codeContext}</code></pre>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* Action / Answer State */}
        {!isExpanded && !evaluation ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full py-2.5 px-4 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 rounded-md text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Write Explanation or Fix</span>
            <span>↓</span>
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
              className="w-full h-32 bg-[#09090b] border border-zinc-800 rounded-md p-3.5 text-zinc-200 text-xs font-sans leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-y"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">Ctrl+Enter</kbd> to submit
              </span>
              <div className="flex gap-2.5 ml-auto">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="px-3.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 rounded border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !answer.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-medium tracking-tight transition-all cursor-pointer flex items-center gap-2 shadow-xs shadow-indigo-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Evaluation Output */
          <div className="mt-5 border-t border-zinc-800/80 pt-5 animate-in fade-in duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1 rounded text-sm font-mono font-bold border ${
                  evaluation.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  evaluation.score >= 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {evaluation.score} / 100
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Tech Lead Review
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Evaluated via Gemini</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-3.5 py-0.5">
              {evaluation.feedback}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {correctItems.length > 0 && (
                <div className="p-3 rounded-md bg-emerald-950/20 border border-emerald-800/30">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified Strengths
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
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
                <div className="p-3 rounded-md bg-amber-950/20 border border-amber-800/30">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Nuances & Edge Cases
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
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
