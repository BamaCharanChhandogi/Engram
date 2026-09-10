'use client';

import { useState, useEffect } from 'react';
import QuestionCard from '@/components/QuestionCard';

export default function DashboardPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/practice/today');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.questions || []).map((q: any) => ({
          id: q.id,
          type: q.questionType || q.type || 'comprehension',
          difficulty: q.difficulty || 'medium',
          question: q.questionText || q.question,
          codeContext: q.codeContext,
          referenceAnswer: q.referenceAnswer,
        }));
        setQuestions(mapped);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      if (res.ok) {
        setStatusMessage('Fresh questions generated from your latest session diffs.');
        await fetchQuestions();
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setStatusMessage('No new code captures found for today yet. Make edits in your IDE or CLI to generate questions.');
        } else {
          setStatusMessage(err.message || 'Generation request failed.');
        }
      }
    } catch (error) {
      console.error('Failed to generate:', error);
      setStatusMessage('Network error while requesting generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Active Recall Session
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Today's Practice</h1>
          <p className="text-xs font-mono text-zinc-400 mt-0.5" suppressHydrationWarning>{today}</p>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-medium tracking-tight transition-all cursor-pointer flex items-center gap-2 shadow-xs shadow-indigo-500/20"
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Diffs...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              <span>Generate Questions</span>
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-500 hover:text-zinc-300 ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Questions Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-[#121215] animate-pulse rounded-lg border border-zinc-800/80"></div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 px-6 bg-[#121215] rounded-lg border border-zinc-800/80 space-y-4">
          <div className="w-10 h-10 rounded-md bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-xs font-mono text-zinc-400">
            0/0
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-200">No active practice questions</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              When you code in Claude Code, Cursor, Codex, or Antigravity, your diffs automatically generate review reps here.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Scan Recent Diffs Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span>{questions.length} Questions Derived from Recent Commits</span>
            <span>Target: 3/3 daily reps</span>
          </div>
          {questions.map((q) => (
            <QuestionCard key={q.id} {...q} onAnswered={fetchQuestions} />
          ))}
        </div>
      )}
    </div>
  );
}
