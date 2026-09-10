'use client';

import { useState } from 'react';
import Link from 'next/link';

export const TARGET_OPTIONS = [
  {
    id: 'sde1',
    label: 'SDE-1',
    fullTitle: 'SDE-1 (Full-Time Engineer)',
    desc: 'Modular clean code, unit test coverage, error handling, defensive input validation',
  },
  {
    id: 'sde2',
    label: 'SDE-2',
    fullTitle: 'SDE-2 (Mid-Level Engineer)',
    desc: 'Concurrency, race conditions, database state locks, idempotency & retry semantics',
  },
  {
    id: 'senior',
    label: 'Senior',
    fullTitle: 'Senior Engineer (SDE-3)',
    desc: 'Distributed systems, latency vs consistency tradeoffs, blast radius, failure modes',
  },
  {
    id: 'staff',
    label: 'Staff',
    fullTitle: 'Staff / Principal Engineer',
    desc: 'Cross-boundary architecture, zero-downtime migrations, tech debt & org reliability',
  },
];

interface QuickTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTarget: string;
  onTargetUpdated?: (newTarget: string) => void;
}

export default function QuickTargetModal({
  isOpen,
  onClose,
  currentTarget,
  onTargetUpdated,
}: QuickTargetModalProps) {
  const [selectedTarget, setSelectedTarget] = useState(currentTarget || 'sde2');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelect = async (targetId: string) => {
    setSelectedTarget(targetId);
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLevel: targetId }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onTargetUpdated) {
          onTargetUpdated(targetId);
        }
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error('Failed to update target:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 space-y-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium">
                Active Recall Ladder
              </span>
            </div>
            <h3 className="font-serif text-2xl text-[var(--text-primary)]">
              Calibrate Career Target
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              1-click switch. Your daily questions and review rubrics calibrate instantly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Level List */}
        <div className="space-y-2.5">
          {TARGET_OPTIONS.map((option) => {
            const isSelected = (selectedTarget || currentTarget) === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isSaving}
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--border-focus)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-primary)]'}`}>
                      {option.fullTitle}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--accent)] text-[#050505] font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    {option.desc}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-focus)]'
                  }`}>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#050505]" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with subtle link to full profile */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
          >
            Configure custom stack & focus areas →
          </Link>

          {savedSuccess ? (
            <span className="text-[var(--accent)] font-medium flex items-center gap-1.5">
              <span>✓</span> Target Calibrated
            </span>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
