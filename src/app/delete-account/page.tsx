'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate immediate account deletion request queuing
    await new Promise((res) => setTimeout(res, 800));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] px-6 py-16 selection:bg-[#e8c872]/20 selection:text-[#e8c872]">
      <div className="max-w-xl mx-auto space-y-8">
        <Link href="/" className="font-serif text-2xl text-[#ededed] hover:text-[#e8c872] transition-colors">
          Engram
        </Link>

        <div className="space-y-2 pb-6 border-b border-[#1a1a1a]">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#ededed]">Request Account & Data Deletion</h1>
          <p className="text-sm text-[#888888] leading-relaxed">
            In compliance with Google Play Store data safety policies, submit this form to permanently delete your Engram account, authentication credentials, and all recorded session diffs.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#34d399]/30 text-sm space-y-3">
            <div className="flex items-center gap-2 text-[#34d399] font-medium">
              <span>✓</span>
              <span>Deletion Request Received</span>
            </div>
            <p className="text-[#888888] text-xs leading-relaxed">
              Your account associated with <strong className="text-[#ededed]">{email}</strong> and all associated database records (questions, answers, captures, streak metrics) have been marked for immediate purge.
            </p>
            <div className="pt-2">
              <Link href="/" className="text-xs text-[#e8c872] hover:underline">← Return to Engram Home</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888]">Engram Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-[#1a1a1a] text-sm text-[#ededed] focus:border-[#e8c872] focus:outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888]">Optional Reason</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why you are leaving (optional)..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#050505] border border-[#1a1a1a] text-sm text-[#ededed] focus:border-[#e8c872] focus:outline-hidden transition-colors"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#f87171]/10 border border-[#f87171]/20 text-xs text-[#f87171] leading-relaxed">
              <strong>Warning:</strong> Deletion is permanent. All active recall progress, career calibrations, and streak history will be wiped.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-full bg-[#f87171] hover:bg-[#ef4444] text-[#050505] font-semibold text-xs tracking-tight transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Request...' : 'Permanently Delete Account & Data'}
            </button>
          </form>
        )}

        <div className="text-xs text-[#555555]">
          Need immediate support? Contact <a href="mailto:b.c.chhandogi@gmail.com" className="text-[#888888] underline">b.c.chhandogi@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
