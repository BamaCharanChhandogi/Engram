'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';

export default function DashboardPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Standup prep state
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false);
  const [standupData, setStandupData] = useState<any>(null);
  const [showStandupModal, setShowStandupModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

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
          agentSource: q.agentSource || 'claude-code',
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
    fetchProfile();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      if (res.ok) {
        setStatusMessage('Fresh questions generated and calibrated for your target career level.');
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

  const handleGenerateStandup = async () => {
    setIsGeneratingStandup(true);
    try {
      const res = await fetch('/api/practice/standup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStandupData(data);
        setShowStandupModal(true);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMessage(err.message || 'Could not generate standup prep from today diffs.');
      }
    } catch (err) {
      console.error('Standup prep error:', err);
      setStatusMessage('Network error while generating standup prep.');
    } finally {
      setIsGeneratingStandup(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric' 
  });

  const currentLvl = (profile?.currentLevel || 'sde1').toUpperCase();
  const targetLvl = (profile?.targetLevel || 'sde2').toUpperCase();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              Daily Active Recall Session
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
            Today's Practice
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5" suppressHydrationWarning>
            {today}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleGenerateStandup}
            disabled={isGeneratingStandup}
            className="px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            {isGeneratingStandup ? (
              <>
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating brief...</span>
              </>
            ) : (
              <>
                <span className="text-[11px]">⚡</span>
                <span>Standup & PR Brief</span>
              </>
            )}
          </button>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[#050505] rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                <span>Calibrating diffs...</span>
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
      </div>

      {/* Career Target Calibration Banner */}
      <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-zinc-400">Target Track:</span>
          <span className="text-zinc-200 font-medium">{currentLvl}</span>
          <span className="text-zinc-500">→</span>
          <span className="text-[var(--accent)] font-medium">{targetLvl}</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-400 hidden sm:inline">Calibrated for {targetLvl} interview depth</span>
        </div>
        <Link
          href="/dashboard/profile"
          className="text-zinc-400 hover:text-white transition-colors shrink-0 text-xs"
        >
          Edit Target →
        </Link>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Questions Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-[var(--bg-surface)] animate-pulse rounded-xl border border-[var(--border)]"></div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 px-6 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] space-y-4">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border)] mx-auto flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
            0/0
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">No active practice questions</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              When you code in Claude Code, Cursor, Codex, or Antigravity, your diffs automatically generate review reps here calibrated for your target level.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-[var(--bg-surface-hover)] hover:bg-[var(--border-focus)] border border-[var(--border)] rounded-full text-sm font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Scan recent diffs now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Questions Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium pb-1">
              <span>{questions.length} questions calibrated for {targetLvl}</span>
              <span>Daily Reps</span>
            </div>
            {questions.map((q) => (
              <QuestionCard key={q.id} {...q} onAnswered={fetchQuestions} />
            ))}
          </div>

          {/* Right-Side Table of Contents / Outline */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-8 space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--accent)] font-medium block">
                    Session Gist
                  </span>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                    Jump to Question
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                  {questions.length} reps
                </span>
              </div>

              {/* Scrollable Questions Outline */}
              <nav className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const num = String(idx + 1).padStart(2, '0');
                  const typeDot = 
                    q.type === 'debugging' ? 'bg-amber-400' :
                    q.type === 'interview' ? 'bg-purple-400' :
                    'bg-[var(--accent)]';

                  const cleanType = 
                    q.type === 'debugging' ? 'Debugging' :
                    q.type === 'interview' ? 'System Design' :
                    'Comprehension';

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        const el = document.getElementById(`question-${q.id}`);
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] transition-all group cursor-pointer border border-transparent hover:border-white/[0.06]"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-xs text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0 pt-0.5">
                          {num}
                        </span>
                        <div className="overflow-hidden flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${typeDot} shrink-0`} />
                            <span className="text-[11px] text-[var(--text-tertiary)] group-hover:text-zinc-300 transition-colors">
                              {cleanType}
                            </span>
                            {q.agentSource && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                • {q.agentSource === 'claude-code' ? 'Claude' : q.agentSource === 'cursor' ? 'Cursor' : q.agentSource}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-2 leading-snug">
                            {q.question}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Standup Brief Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Standup Brief</span>
                <span className="text-[10px] text-[var(--accent)] font-medium">60s Summary</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Need to brief your tech lead? Generate a 3-bullet talking point summary.
              </p>
              <button
                onClick={handleGenerateStandup}
                disabled={isGeneratingStandup}
                className="w-full py-2 px-3 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡ Generate Standup Prep</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Standup & PR Defense Brief Modal */}
      {showStandupModal && standupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium">
                  60-Second Standup & PR Defense
                </span>
                <h3 className="font-serif text-2xl text-[var(--text-primary)] mt-0.5">
                  Today's Engineering Summary
                </h3>
              </div>
              <button
                onClick={() => setShowStandupModal(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium mb-1">
                  Headline for Standup
                </p>
                <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                  "{standupData.headline}"
                </p>
              </div>

              {standupData.keyDecisions && standupData.keyDecisions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider">
                    Key Architectural Decisions Made
                  </p>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    {standupData.keyDecisions.map((dec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[var(--accent)]">•</span>
                        <span>{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {standupData.tradeoffsConsidered && standupData.tradeoffsConsidered.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                    Trade-offs / Alternatives Rejected
                  </p>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    {standupData.tradeoffsConsidered.map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[var(--text-tertiary)]">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {standupData.risksAndMitigations && standupData.risksAndMitigations.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-[var(--danger)] font-medium uppercase tracking-wider">
                    Production Risks & Edge Cases Verified
                  </p>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                    {standupData.risksAndMitigations.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[var(--danger)]">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowStandupModal(false)}
                className="px-5 py-2 rounded-full bg-[var(--accent)] text-[#050505] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
