'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl text-[var(--text-primary)] tracking-tight">
            Engram
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#problem" className="hover:text-[var(--text-primary)] transition-colors">Problem</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-5 py-2 rounded-full bg-[var(--accent)] text-[#050505] hover:bg-[var(--accent-hover)] transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-28 pb-20 px-6 overflow-hidden">
          {/* Warm ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--accent)] opacity-[0.04] blur-[150px] pointer-events-none rounded-full" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="max-w-3xl">
              <p className="text-sm text-[var(--accent)] font-medium mb-6">
                Cognitive retention for AI-assisted development
              </p>

              <h1 className="font-serif text-5xl sm:text-7xl text-[var(--text-primary)] leading-[1.05] mb-6">
                Your AI writes the code.
                <br />
                <span className="text-[var(--text-secondary)]">
                  Make sure you understand it.
                </span>
              </h1>

              <p className="text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed mb-10">
                Studies show a 17% decline in debugging proficiency among developers using AI assistants. Engram captures your session diffs and turns them into 5-minute active recall practice.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/register"
                  className="px-7 py-3 rounded-full bg-[var(--accent)] text-[#050505] text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
                >
                  Start for free
                </Link>
                <a
                  href="#how-it-works"
                  className="px-7 py-3 rounded-full border border-[var(--border-focus)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-all"
                >
                  See how it works
                </a>
              </div>

              {/* Agent compatibility */}
              <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-tertiary)]">
                <span>Works with</span>
                <span className="text-[var(--text-secondary)]">Claude Code</span>
                <span className="text-[var(--text-secondary)]">Cursor</span>
                <span className="text-[var(--text-secondary)]">Codex CLI</span>
                <span className="text-[var(--text-secondary)]">Antigravity</span>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Preview */}
        <section className="px-6 pb-32">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              {/* Window chrome */}
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  </div>
                  <span className="text-sm text-[var(--text-tertiary)]">session_capture.ts</span>
                </div>
                <span className="text-sm text-[var(--success)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Active
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Captured */}
                <div className="space-y-4">
                  <div className="text-sm text-[var(--text-tertiary)]">Session captured</div>
                  <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
                    <p className="text-sm text-[var(--accent)]">User prompt:</p>
                    <p className="text-sm text-[var(--text-secondary)] italic pl-4 border-l-2 border-[var(--accent)]/30">
                      "Add idempotent stripe refund handler with database state lock"
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)] pt-1">
                      Diff captured: +24 lines in payment.ts
                    </p>
                  </div>
                </div>

                {/* Right: Generated */}
                <div className="space-y-4">
                  <div className="text-sm text-[var(--text-tertiary)]">Generated recall question</div>
                  <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-sm bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20">
                        Debugging
                      </span>
                      <span className="text-sm text-[var(--text-tertiary)]">Hard</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      "If Stripe refund succeeds but local DB transaction fails, how does your idempotency key prevent duplicate refunds on caller retry?"
                    </p>
                    <div className="pt-2 text-sm text-[var(--text-tertiary)] flex items-center justify-between border-t border-[var(--border)]">
                      <span>15-minute recall</span>
                      <span className="text-[var(--success)]">+15 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-32 px-6 bg-[var(--bg-surface)]">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-16">
              <p className="text-sm text-[var(--accent)] font-medium mb-4">The evidence</p>
              <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight mb-4">
                AI is eroding developer
                <br className="hidden sm:block" />
                mental models
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                Software velocity has multiplied, but the engineers shipping the code understand less of it every day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
                <div className="font-serif text-5xl text-[var(--danger)] mb-4">-17%</div>
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Debugging comprehension</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Stanford and Anthropic RCT testing 52 engineers documented a nearly two full letter-grade decline in post-task debugging proficiency when using AI.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
                <div className="font-serif text-5xl text-[var(--warning)] mb-4">84 to 29%</div>
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Adoption vs trust gap</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Stack Overflow data reveals 84% adoption, but trust in accuracy plummeted below 30%. Engineers spend 80% of their day reviewing code they did not write.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
                <div className="font-serif text-5xl text-[var(--accent)] mb-4">5 min</div>
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">Active recall solution</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  3 targeted questions a day from code you shipped preserves memory consolidation without slowing down daily coding velocity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-2xl mb-20">
              <p className="text-sm text-[var(--accent)] font-medium mb-4">How it works</p>
              <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight">
                Three steps, zero friction
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div>
                <div className="font-serif text-6xl text-[var(--border-focus)] mb-6">01</div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Silent capture</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Hooks into Cursor, Claude Code, Codex, or Antigravity lifecycle events. Sends prompts and diffs to your dashboard in the background with zero delay.
                </p>
              </div>

              <div>
                <div className="font-serif text-6xl text-[var(--border-focus)] mb-6">02</div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">AI synthesis</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Our pipeline inspects your diffs to generate comprehension challenges, edge-case debugging puzzles, and system design questions derived from your actual work.
                </p>
              </div>

              <div>
                <div className="font-serif text-6xl text-[var(--border-focus)] mb-6">03</div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Daily reps</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Take 5 minutes before standup or at end of day to answer your reps. Get graded against senior engineering standards and build your streak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6 bg-[var(--bg-surface)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <p className="text-sm text-[var(--accent)] font-medium mb-4">Pricing</p>
              <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight mb-4">
                Invest in your engineering edge
              </h2>
              <p className="text-base text-[var(--text-secondary)] mb-8">
                Free for solo developers. Scale as your team grows.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-sm">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${!annualBilling ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-2 ${annualBilling ? 'bg-[var(--accent)] text-[#050505] font-medium' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                >
                  Annual
                  <span className={`text-xs ${annualBilling ? 'text-[#050505]/70' : 'text-[var(--success)]'}`}>-20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Free */}
              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex flex-col justify-between">
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">Hobby</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">For individual engineers getting started.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-[var(--text-primary)]">$0</span>
                    <span className="text-sm text-[var(--text-tertiary)]">/ forever</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> 3 practice questions / day
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> 7-day session history
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> Gemini 3.6 Flash engine
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> All agent hooks included
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full border border-[var(--border-focus)] text-[var(--text-secondary)] text-sm text-center hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-all"
                >
                  Start free
                </Link>
              </div>

              {/* Pro — Featured */}
              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border-2 border-[var(--accent)]/40 flex flex-col justify-between relative">
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">Pro</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">For daily AI coders building mastery.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-[var(--text-primary)]">
                      ${annualBilling ? '10' : '12'}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">/ month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--accent)]">&#10003;</span> <strong className="text-[var(--text-primary)]">Unlimited</strong> daily questions
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--accent)]">&#10003;</span> Spaced repetition queue
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--accent)]">&#10003;</span> Deep reasoning evaluation
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--accent)]">&#10003;</span> Prompt engineering coach
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--accent)]">&#10003;</span> Permanent history and analytics
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full bg-[var(--accent)] text-[#050505] text-sm font-medium text-center hover:bg-[var(--accent-hover)] transition-all"
                >
                  Upgrade to Pro
                </Link>
              </div>

              {/* Team */}
              <div className="p-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex flex-col justify-between">
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">Team</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">For tech leads safeguarding codebase quality.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-[var(--text-primary)]">
                      ${annualBilling ? '24' : '29'}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">/ seat / month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> Everything in Pro
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> Team knowledge distribution map
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> PR comprehension checks
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> Onboarding acceleration metrics
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-[var(--success)]">&#10003;</span> SAML SSO and centralized billing
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full border border-[var(--border-focus)] text-[var(--text-secondary)] text-sm text-center hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-all"
                >
                  Contact for teams
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-16">
              <p className="text-sm text-[var(--accent)] font-medium mb-4">FAQ</p>
              <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight">
                Answers for engineers
              </h2>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {[
                {
                  q: 'Does my entire proprietary codebase get uploaded?',
                  a: 'No. Hooks only observe active session diffs and user prompts. You can configure local repository blocklists (.engramignore), and our capture scripts operate strictly within the boundary you define.',
                },
                {
                  q: 'Will the hook slow down Cursor or Claude Code?',
                  a: 'No. Hook scripts spawn as detached background processes and return immediately (0ms synchronous wait). If your internet drops or our server is under load, the hook fails silently without interrupting your coding flow.',
                },
                {
                  q: 'How are practice questions generated?',
                  a: 'We use Google Gemini 3.6 Flash configured in structured JSON mode to inspect edge cases, concurrency hazards, and architectural patterns in your session diffs.',
                },
              ].map((item, i) => (
                <div key={i} className="py-6">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <h3 className="text-base font-medium text-[var(--text-primary)] group-hover:text-white transition-colors pr-4">
                      {item.q}
                    </h3>
                    <span className="text-[var(--text-tertiary)] text-xl shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-4 pr-12">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-tertiary)]">
          <span className="font-serif">Engram</span>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="hover:text-[var(--text-secondary)] transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-[var(--text-secondary)] transition-colors">How it works</a>
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">Dashboard</Link>
          </div>
          <span>2026</span>
        </div>
      </footer>
    </div>
  );
}
