'use client';

import { useState, useEffect } from 'react';

const LEVEL_OPTIONS = [
  { id: 'intern', label: 'Intern / Junior', desc: 'Syntax, foundational API usage, basic task execution' },
  { id: 'sde1', label: 'SDE-1 (Current Default)', desc: 'Writing clean modular features, unit tests, code review hygiene' },
  { id: 'sde2', label: 'SDE-2 (Mid-Level)', desc: 'Concurrency, race conditions, idempotency, failure mode resilience' },
  { id: 'senior', label: 'Senior Engineer', desc: 'Distributed architecture, scalability bottlenecks, blast radius, mentoring' },
  { id: 'staff', label: 'Staff / Tech Lead', desc: 'Org-wide technical strategy, domain decoupling, cross-team reliability' },
];

const TARGET_OPTIONS = [
  { id: 'sde1', label: 'SDE-1 (Full-Time Engineer)', desc: 'Master clean modular code, unit test coverage, error handling, and self-sufficient implementation' },
  { id: 'sde2', label: 'SDE-2 (Mid-Level)', desc: 'Master production edge cases, database locks, and self-sufficient debugging' },
  { id: 'senior', label: 'Senior Engineer (SDE-3)', desc: 'Master distributed systems, latency vs consistency, and system design' },
  { id: 'staff', label: 'Staff / Principal', desc: 'Master cross-boundary architecture, zero-downtime migrations, and tech debt' },
];

const AVAILABLE_FOCUS_AREAS = [
  'Concurrency & Race Conditions',
  'Database Internals & State Locks',
  'Idempotency & Retry Semantics',
  'Distributed Failure Modes',
  'Latency & Query Optimization',
  'API Backwards Compatibility',
  'Security & Auth Boundaries',
  'Memory Leaks & Resource Cleanup',
];

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentLevel, setCurrentLevel] = useState('sde1');
  const [targetLevel, setTargetLevel] = useState('sde2');
  const [primaryStack, setPrimaryStack] = useState('TypeScript, React, Node.js, PostgreSQL');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    'Concurrency & Race Conditions',
    'Database Internals & State Locks',
    'Idempotency & Retry Semantics',
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
          if (data.currentLevel) setCurrentLevel(data.currentLevel);
          if (data.targetLevel) setTargetLevel(data.targetLevel);
          if (data.primaryStack) setPrimaryStack(data.primaryStack);
          if (data.focusAreas) {
            const parsed = data.focusAreas.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (parsed.length > 0) setSelectedFocus(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleFocusArea = (area: string) => {
    if (selectedFocus.includes(area)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter((a) => a !== area));
      }
    } else {
      setSelectedFocus([...selectedFocus, area]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          currentLevel,
          targetLevel,
          primaryStack: primaryStack.trim(),
          focusAreas: selectedFocus.join(', '),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('Network error while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="h-20 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]" />
        <div className="h-64 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]" />
      </div>
    );
  }

  const currentLevelObj = LEVEL_OPTIONS.find((l) => l.id === currentLevel) || LEVEL_OPTIONS[1];
  const targetLevelObj = TARGET_OPTIONS.find((l) => l.id === targetLevel) || TARGET_OPTIONS[0];

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium">
            Cognitive Career Calibration
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">
          Engineering Profile & Career Target
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          Engram uses your current role and promotion target to customize question depth, edge cases, and evaluation rubrics from your day's coding diffs.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-sm text-[var(--accent)] flex items-center gap-2">
          <span>✓</span>
          <span>Profile saved! Next practice questions will be calibrated for {targetLevelObj.label}.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-sm text-[var(--danger)]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-10">
        {/* Career Ladder Progression Widget */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">Career Progression Track</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Define the promotion gap you are actively closing.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-xs font-medium">
              <span className="text-[var(--text-secondary)]">{currentLevelObj.label}</span>
              <span className="text-[var(--accent)]">➔</span>
              <span className="text-[var(--accent)] font-semibold">{targetLevelObj.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Current Level */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Current Level
              </label>
              <div className="space-y-2">
                {LEVEL_OPTIONS.map((level) => {
                  const isSelected = currentLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setCurrentLevel(level.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                          : 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-focus)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isSelected ? 'text-[var(--accent)]' : ''}`}>
                          {level.label}
                        </span>
                        {isSelected && <span className="text-xs text-[var(--accent)] font-semibold">Active</span>}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">{level.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Level */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Target Promotion Level
              </label>
              <div className="space-y-2">
                {TARGET_OPTIONS.map((level) => {
                  const isSelected = targetLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setTargetLevel(level.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                          : 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-focus)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isSelected ? 'text-[var(--accent)]' : ''}`}>
                          {level.label}
                        </span>
                        {isSelected && <span className="text-xs text-[var(--accent)] font-semibold">Target</span>}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">{level.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-base font-medium text-[var(--text-primary)]">Engineering Focus Areas</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select specific competencies you want Gemini to challenge you on in daily diffs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_FOCUS_AREAS.map((area) => {
              const isSelected = selectedFocus.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--accent)] text-[#050505] border-[var(--accent)] font-semibold'
                      : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Stack & Details */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-base font-medium text-[var(--text-primary)]">Primary Technology Stack</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Helps Engram formulate idiomatic architectural questions for your environment.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1.5 font-medium">
                Languages, Frameworks, & Databases
              </label>
              <input
                type="text"
                value={primaryStack}
                onChange={(e) => setPrimaryStack(e.target.value)}
                placeholder="e.g. TypeScript, React, Go, PostgreSQL, Redis, Kafka"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1.5 font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1.5 font-medium">Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border)] text-sm text-[var(--text-tertiary)] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live AI Calibration Preview */}
        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-medium uppercase tracking-wider">
            <span>⚡ AI Engine Calibration Preview</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            When you trigger practice questions from your IDE or CLI captures, Engram will prompt Gemini with:
          </p>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] leading-relaxed space-y-1.5">
            <p className="text-[var(--accent)]">Engram Target Calibration Prompt</p>
            <p className="text-[var(--text-primary)]">
              "Evaluate developer's code diffs to bridge the gap from <strong className="text-[var(--accent)]">{currentLevelObj.label}</strong> to <strong className="text-[var(--accent)]">{targetLevelObj.label}</strong>."
            </p>
            <p className="text-[var(--text-tertiary)]">
              Focus: {selectedFocus.slice(0, 3).join(', ')}...
            </p>
            <p className="text-[var(--text-tertiary)]">
              Evaluation standard: Senior peer review with edge-case and failure mode analysis.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#050505] text-sm font-semibold tracking-tight transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                <span>Saving target...</span>
              </>
            ) : (
              <span>Save Career Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
