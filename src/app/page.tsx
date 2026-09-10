'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs shadow-indigo-500/20">
              //
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              Engram
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How it works</a>
            <a href="#problem" className="hover:text-zinc-200 transition-colors">The 17% Problem</a>
            <a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs font-mono px-3.5 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-xs font-medium px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs shadow-indigo-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-20 px-6 border-b border-zinc-800/60 overflow-hidden">
          {/* Subtle glow backdrop */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            {/* Kicker badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-mono tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Cognitive Retention Layer for AI Coding
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.1]">
              Your AI writes the code.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-indigo-400">
                We make sure you understand it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Empirical trials show a <strong className="text-zinc-200">17% decline in debugging proficiency</strong> among developers using AI assistants. Engram silently captures your session diffs and turns them into 5-minute active recall practice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 text-center"
              >
                Connect Your Agent Free
              </Link>
              <a 
                href="#how-it-works" 
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition-colors text-center"
              >
                Inspect The Architecture →
              </a>
            </div>

            {/* Agent badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>Claude Code</span>
              <span className="text-zinc-800">•</span>
              <span>Cursor IDE</span>
              <span className="text-zinc-800">•</span>
              <span>OpenAI Codex CLI</span>
              <span className="text-zinc-800">•</span>
              <span>Google Antigravity</span>
            </div>
          </div>

          {/* Terminal / Live Preview Mockup */}
          <div className="max-w-4xl mx-auto mt-16 rounded-lg border border-zinc-800 bg-[#0c0c0e] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs font-mono text-zinc-400">session_capture.ts — active recall pipeline</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Hook: Non-blocking (0ms overhead)
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#0a0a0c]">
              {/* Left Column: What your AI did */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>01 // Local Session Captured</span>
                  <span>14:22:01</span>
                </div>
                <div className="p-3.5 rounded bg-[#121215] border border-zinc-800/80 font-mono text-xs space-y-2 text-zinc-300">
                  <p className="text-indigo-400">&gt; User prompt:</p>
                  <p className="text-zinc-300 italic pl-3 border-l-2 border-indigo-500/40">"Add idempotent stripe refund handler with database state lock"</p>
                  <p className="text-zinc-500 pt-2 text-[11px]">// PostToolUse diff captured: +24 lines in payment.ts</p>
                </div>
              </div>

              {/* Right Column: What Engram tests you on */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>02 // Generated Active Recall</span>
                  <span className="text-indigo-400">Gemini 3.6 Flash</span>
                </div>
                <div className="p-3.5 rounded bg-[#121215] border border-zinc-800/80 font-sans text-xs space-y-2">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">DEBUGGING</span>
                    <span className="text-zinc-500">HARD</span>
                  </div>
                  <p className="text-zinc-200 font-medium leading-relaxed">
                    "If Stripe refund succeeds but local DB transaction fails, how does your idempotency key prevent duplicate refunds on caller retry?"
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-zinc-500 flex items-center justify-between border-t border-zinc-800/60">
                    <span>Expected: 15-minute recall</span>
                    <span className="text-emerald-400 font-medium">+15 XP / Streak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="py-24 px-6 border-b border-zinc-800/60 bg-[#0c0c0e]">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">The Empirical Evidence</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
                The AI Cognitive Debt Crisis
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Software velocity has multiplied 5x, but developer mental models are eroding.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-3">
                <div className="text-3xl font-bold font-mono text-rose-400">-17%</div>
                <h3 className="font-semibold text-sm text-zinc-200">Debugging Comprehension</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stanford & Anthropic RCT testing 52 engineers documented a nearly two full letter-grade decline in post-task debugging proficiency when using AI.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-3">
                <div className="text-3xl font-bold font-mono text-amber-400">84% → 29%</div>
                <h3 className="font-semibold text-sm text-zinc-200">Adoption vs Trust Gap</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stack Overflow data reveals 84% adoption, but trust in accuracy plummeted below 30%. Engineers spend 80% of their day reviewing code they didn't write.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-3">
                <div className="text-3xl font-bold font-mono text-indigo-400">5 Min</div>
                <h3 className="font-semibold text-sm text-zinc-200">Active Recall Solution</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  3 targeted questions a day from code you shipped preserves memory consolidation without slowing down daily coding velocity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 border-b border-zinc-800/60">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">Architecture</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
                Three Steps. Zero Friction.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="space-y-4">
                <div className="text-xs font-mono text-indigo-400 font-bold">01 // SILENT CAPTURE</div>
                <h3 className="text-lg font-semibold text-zinc-100">Installs in 10 Seconds</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hooks into Cursor, Claude Code, Codex, or Antigravity lifecycle events. Sends prompts and diffs to your dashboard in the background with zero terminal delay.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-mono text-indigo-400 font-bold">02 // GEMINI SYNTHESIS</div>
                <h3 className="text-lg font-semibold text-zinc-100">Extracts Architectural Nuances</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Our pipeline inspects your diffs to generate 2 comprehension challenges, 1 edge-case debugging puzzle, and 1 system design question derived directly from your work.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-mono text-indigo-400 font-bold">03 // DAILY REPS</div>
                <h3 className="text-lg font-semibold text-zinc-100">Cement Real Mastery</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Take 5 minutes before your morning standup or at end of day to answer your reps. Get graded against senior engineering standards and build your streak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 border-b border-zinc-800/60 bg-[#0c0c0e]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">Pricing</span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100">
                Invest in Your Engineering Edge
              </h2>
              <p className="text-sm text-zinc-400">
                Free for solo developers. Scale as your team's code output accelerates.
              </p>

              {/* Annual toggle */}
              <div className="inline-flex items-center gap-3 p-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${!annualBilling ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${annualBilling ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] text-emerald-300 font-bold">SAVE 20%</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Developer Free */}
              <div className="p-8 rounded-lg bg-[#121215] border border-zinc-800/80 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-base text-zinc-200">Hobby Developer</h3>
                    <p className="text-xs text-zinc-500 mt-1">Essential skill retention for individual engineers.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-zinc-100">$0</span>
                    <span className="text-xs text-zinc-500 font-mono">/ forever</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-normal">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> 3 practice questions / day
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> 7-day session history
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> Standard Gemini 3.6 Flash engine
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> Claude Code, Cursor, Codex hooks
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono text-center uppercase tracking-wider transition-colors"
                >
                  Start Free
                </Link>
              </div>

              {/* Pro Tier (Highlighted) */}
              <div className="p-8 rounded-lg bg-[#141419] border-2 border-indigo-500/80 relative flex flex-col justify-between space-y-8 shadow-xl shadow-indigo-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] uppercase tracking-widest font-semibold">
                  Most Popular
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-base text-zinc-100">Professional Engineer</h3>
                    <p className="text-xs text-zinc-400 mt-1">For daily AI coders building senior interview mastery.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-zinc-100">
                      ${annualBilling ? '10' : '12'}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-200 font-normal">
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-mono">✓</span> <strong>Unlimited</strong> daily practice questions
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-mono">✓</span> <strong>Spaced Repetition Queue</strong> (retests bugs at 3, 7, 14 days)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-mono">✓</span> Deep reasoning evaluation (Gemini 2.5 Pro / Claude 3.7)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-mono">✓</span> <strong>Prompt Engineering Coach</strong> with auto-rewrites
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-indigo-400 font-mono">✓</span> Permanent history & streak analytics
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30"
                >
                  Upgrade to Pro
                </Link>
              </div>

              {/* Team Tier */}
              <div className="p-8 rounded-lg bg-[#121215] border border-zinc-800/80 flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-base text-zinc-200">Engineering Teams</h3>
                    <p className="text-xs text-zinc-500 mt-1">For Tech Leads and CTOs safeguarding codebase quality.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-zinc-100">
                      ${annualBilling ? '24' : '29'}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/ seat / month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-normal">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> Everything in Pro
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> <strong>Team Knowledge Distribution Map</strong>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> PR comprehension checks before merge
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> Onboarding acceleration metrics
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-mono">✓</span> SAML SSO & Centralized billing
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono text-center uppercase tracking-wider transition-colors"
                >
                  Contact For Teams
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Technical FAQ */}
        <section id="faq" className="py-24 px-6 border-b border-zinc-800/60">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">Technical FAQ</span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Answers for Engineers</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-100">Does my entire proprietary codebase get uploaded?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No. Hooks only observe active session diffs and user prompts. You can configure local repository blocklists (`.engramignore`), and our capture scripts operate strictly within the boundary you define.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-100">Will the hook slow down Cursor or Claude Code?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No. Hook scripts spawn as detached background processes and return immediately (`0ms` synchronous wait). If your internet drops or our server is under heavy load, the hook fails silently without interrupting your coding flow.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-100">How are practice questions generated?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We use Google Gemini 3.6 Flash and Claude models configured in structured JSON mode to inspect edge cases, concurrency hazards, and architectural patterns in your day's diffs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800/80 bg-[#09090b]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
              D
            </div>
            <span>Engram © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-zinc-300 transition-colors">Architecture</a>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
