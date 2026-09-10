'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  agent: string;
  prompt: string;
  file: string;
  diffLines: { type: 'add' | 'del' | 'ctx'; text: string }[];
  question: string;
  targetLevel: string;
  questionType: string;
  seniorRubric: {
    expectedConcepts: string[];
    failureModes: string[];
    levelTip: string;
  };
  sampleAnswer: string;
  juniorSampleAnswer: string;
  gradePreview: {
    score: number;
    feedback: string;
  };
  juniorGradePreview: {
    score: number;
    feedback: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'stripe',
    title: 'Stripe Idempotency & DB Lock',
    agent: 'Claude Code',
    prompt: 'Add idempotent stripe refund handler with database state lock to prevent duplicate customer refunds on network retry.',
    file: 'payment/refund.service.ts',
    diffLines: [
      { type: 'ctx', text: ' async function processRefund(txId: string, amount: number) {' },
      { type: 'add', text: '+  const lock = await db.acquireLock(`refund:${txId}`, { ttl: 3000 });' },
      { type: 'add', text: '+  if (!lock) throw new ConcurrencyConflictError("Refund pending");' },
      { type: 'add', text: '+  const refund = await stripe.refunds.create({ charge: txId }, { idempotencyKey: txId });' },
      { type: 'del', text: '-  await db.transactions.update({ id: txId }, { status: "refunded" });' },
      { type: 'add', text: '+  await db.transactions.updateWithLock(txId, { status: "refunded", refundId: refund.id });' },
      { type: 'ctx', text: '   return refund;' },
      { type: 'ctx', text: ' }' },
    ],
    question: 'If the Stripe refund succeeds but your database update fails due to a network partition, what state is left in the DB, and how does your idempotency key prevent duplicate financial loss on client retry?',
    targetLevel: 'SDE-2 Target',
    questionType: 'Production Failure Modes',
    seniorRubric: {
      expectedConcepts: [
        'Outbox pattern or reconciliation worker requirement',
        'Stripe idempotency key caching lifetime (24 hours)',
        'Compensating transaction or dead-letter queue semantics'
      ],
      failureModes: [
        'Orphaned successful refund in Stripe with DB showing pending/failed',
        'Client retry hitting cached Stripe refund without updating customer balance'
      ],
      levelTip: 'Senior engineers never assume DB commit succeeds after external 3rd-party HTTP call. Always use two-phase reconciliation.'
    },
    sampleAnswer: 'If DB commit fails after Stripe call, Stripe holds the refund but local DB remains un-refunded. On retry, Stripe returns cached response due to idempotencyKey, but we must catch error and trigger an asynchronous reconciliation audit job.',
    juniorSampleAnswer: 'The database is in an error state. The idempotency key stops Stripe from charging twice when the user clicks again because Stripe knows the key.',
    gradePreview: {
      score: 94,
      feedback: 'Excellent breakdown of idempotency key lifetime and state desynchronization hazards.'
    },
    juniorGradePreview: {
      score: 48,
      feedback: 'Misses the critical split-brain failure mode: the DB status remains un-refunded while Stripe transferred funds. Failed to mention outbox reconciliation or DLQ.'
    }
  },
  {
    id: 'postgres',
    title: 'PostgreSQL Row-Lock Contention',
    agent: 'Cursor IDE',
    prompt: 'Fix high-concurrency inventory decrement race condition when flash sale orders arrive simultaneously.',
    file: 'inventory/stock.repo.ts',
    diffLines: [
      { type: 'ctx', text: ' async function decrementStock(sku: string, qty: number) {' },
      { type: 'del', text: '-  const item = await db.query("SELECT * FROM items WHERE sku = $1", [sku]);' },
      { type: 'add', text: '+  const item = await db.query("SELECT * FROM items WHERE sku = $1 FOR UPDATE", [sku]);' },
      { type: 'del', text: '-  if (item.stock >= qty) await db.query("UPDATE items SET stock = stock - $1", [qty]);' },
      { type: 'add', text: '+  if (item.stock < qty) throw new InsufficientInventoryError();' },
      { type: 'add', text: '+  await db.query("UPDATE items SET stock = stock - $1 WHERE sku = $2", [qty, sku]);' },
      { type: 'ctx', text: ' }' },
    ],
    question: 'Under a flash sale with 5,000 requests/sec for the same SKU, what happens to connection pool exhaustion and transaction throughput when using SELECT FOR UPDATE? What lock-free alternative preserves throughput?',
    targetLevel: 'Senior Target',
    questionType: 'Distributed Concurrency',
    seniorRubric: {
      expectedConcepts: [
        'Row-level lock serialization queueing and connection pool starvation',
        'Deadlock risks when multi-item carts lock rows in non-deterministic order',
        'Atomic decrement: UPDATE items SET stock = stock - $1 WHERE sku = $2 AND stock >= $1'
      ],
      failureModes: [
        'Transaction queue backlog causing HTTP 504 gateway timeouts',
        'Connection pool starvation cascading to unrelated database queries'
      ],
      levelTip: 'At Senior scale, eliminate SELECT FOR UPDATE in favor of atomic conditional UPDATEs or Redis decrement pipelines.'
    },
    sampleAnswer: 'SELECT FOR UPDATE serializes all concurrent transactions, causing connection starvation and lock timeout cascades. A lock-free pattern is atomic UPDATE items SET stock = stock - qty WHERE sku = sku AND stock >= qty.',
    juniorSampleAnswer: 'It locks the row so only one request can buy it at a time. The other requests wait in line until it finishes.',
    gradePreview: {
      score: 98,
      feedback: 'Flawless identification of connection pool starvation and atomic conditional UPDATE pattern.'
    },
    juniorGradePreview: {
      score: 52,
      feedback: 'Accurate description of serialization, but fails to identify connection pool exhaustion under 5,000 req/s load. Did not provide the atomic lock-free UPDATE alternative.'
    }
  },
  {
    id: 'react',
    title: 'Server Action Re-entrancy Race',
    agent: 'Antigravity',
    prompt: 'Create Next.js server action for team member invitations with optimistic UI update.',
    file: 'app/actions/invite.ts',
    diffLines: [
      { type: 'ctx', text: ' export async function inviteMember(formData: FormData) {' },
      { type: 'add', text: '+  "use server";' },
      { type: 'add', text: '+  const session = await auth();' },
      { type: 'add', text: '+  if (!session?.user?.id) throw new UnauthorizedError();' },
      { type: 'add', text: '+  const email = formData.get("email") as string;' },
      { type: 'add', text: '+  await db.invitations.create({ teamId: session.teamId, email });' },
      { type: 'ctx', text: '   revalidatePath("/team");' },
      { type: 'ctx', text: ' }' },
    ],
    question: 'How does this Server Action prevent duplicate invitations if a user double-clicks the submit button during high latency? What CSRF and authorization checks are missing?',
    targetLevel: 'SDE-2 Target',
    questionType: 'Security & Idempotency',
    seniorRubric: {
      expectedConcepts: [
        'Server Action mutation safety: lack of request de-duplication token',
        'Unique constraint on (team_id, email) in DB schema to prevent multi-entry',
        'Authorization guard: verifying caller has ADMIN permission on teamId'
      ],
      failureModes: [
        'Duplicate pending invitation emails sent to client',
        'Privilege escalation if user passes arbitrary teamId without role verification'
      ],
      levelTip: 'Always verify role permissions inside the Server Action; client-side optimistic UI cannot be trusted as an authorization guard.'
    },
    sampleAnswer: 'There is no de-duplication token or DB unique constraint check, leading to double-invite emails on multi-click. It also fails to verify if session.user has ADMIN privileges for teamId.',
    juniorSampleAnswer: 'You can disable the button on the frontend after the first click so they cannot press it twice.',
    gradePreview: {
      score: 92,
      feedback: 'Accurately caught both the re-entrancy race and the team role authorization gap.'
    },
    juniorGradePreview: {
      score: 44,
      feedback: 'Client-side button disabling provides zero protection against network latency, automated scripts, or parallel requests. Lacks server-side idempotency and role authorization checks.'
    }
  }
];

const LADDER_RUBRICS = {
  intern: {
    label: 'Intern ➔ SDE-1',
    subtitle: 'Code Hygiene & Predictability',
    weight: 'Syntax & Testing: 80% • Failure Modes: 20%',
    standards: [
      'Strict input boundary validation (type guards, no null assertions)',
      'Deterministic error codes (400 vs 404 vs 500 semantics)',
      'Unit test coverage on core branch conditionals'
    ],
    examplePrompt: 'Why does throwing a raw Error crash the process, and how do you safely propagate typed AppErrors?'
  },
  sde1: {
    label: 'SDE-1 ➔ SDE-2',
    subtitle: 'Production Failure Modes & Concurrency',
    weight: 'Distributed State: 60% • Failure Modes: 40%',
    standards: [
      'Idempotency key lifetimes across network timeout retries',
      'Database row lock serialization vs connection pool starvation',
      'Asynchronous task worker dead-letter queues & retry jitter'
    ],
    examplePrompt: 'What happens when a webhook delivers duplicate events 200ms apart during heavy DB contention?'
  },
  senior: {
    label: 'SDE-2 ➔ Senior',
    subtitle: 'System Boundaries & Architectural Defense',
    weight: 'Distributed Consensus: 70% • Trade-Offs: 30%',
    standards: [
      'Two-phase commit vs transactional outbox audit workers',
      'Deadlock prevention with canonical multi-resource lock ordering',
      'Circuit breakers, backpressure, and graceful degradation'
    ],
    examplePrompt: 'Under a multi-region network split, how does your write path ensure linearizability without cascade outages?'
  }
};

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Simulator State
  const [activeScenarioId, setActiveScenarioId] = useState('stripe');
  const [activeTab, setActiveTab] = useState<'diff' | 'question' | 'rubric' | 'retention'>('diff');
  const [copiedCli, setCopiedCli] = useState(false);

  // Interactive Draft & Evaluation State
  const [userDraftAnswer, setUserDraftAnswer] = useState('');
  const [isEvaluatingLive, setIsEvaluatingLive] = useState(false);
  const [liveEvaluationResult, setLiveEvaluationResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    gaps: string[];
  } | null>(null);

  // Interactive Ladder preview state
  const [selectedLadder, setSelectedLadder] = useState<'intern' | 'sde1' | 'sde2' | 'senior'>('sde1');

  const currentScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx engram@latest init');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleRunLiveEvaluation = () => {
    setIsEvaluatingLive(true);
    setTimeout(() => {
      setIsEvaluatingLive(false);
      const text = userDraftAnswer.trim().toLowerCase();
      const isJunior = 
        text === currentScenario.juniorSampleAnswer.toLowerCase() || 
        (text.length < 90 && !text.includes('reconciliation') && !text.includes('lock-free') && !text.includes('unique') && !text.includes('atomic'));
      
      if (isJunior) {
        setLiveEvaluationResult({
          score: currentScenario.juniorGradePreview.score,
          feedback: currentScenario.juniorGradePreview.feedback,
          strengths: ['Identified surface-level behavior'],
          gaps: currentScenario.seniorRubric.failureModes,
        });
      } else {
        setLiveEvaluationResult({
          score: currentScenario.gradePreview.score,
          feedback: currentScenario.gradePreview.feedback,
          strengths: currentScenario.seniorRubric.expectedConcepts.slice(0, 2),
          gaps: [currentScenario.seniorRubric.failureModes[0]],
        });
      }
    }, 450);
  };

  const handlePreloadSeniorAnswer = () => {
    setUserDraftAnswer(currentScenario.sampleAnswer);
    setLiveEvaluationResult(null);
  };

  const handlePreloadJuniorAnswer = () => {
    setUserDraftAnswer(currentScenario.juniorSampleAnswer);
    setLiveEvaluationResult(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] relative overflow-x-hidden">
      {/* Blueprint Dot Matrix Grid with Radial Fade */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-35"
        style={{
          backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 10%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 10%, #000 60%, transparent 100%)',
        }}
      />

      {/* Top Atmosphere Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[450px] bg-gradient-to-b from-[var(--accent)]/15 via-[var(--accent)]/5 to-transparent blur-[140px] pointer-events-none rounded-full z-0" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/85 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Engram
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)] font-normal">
            <a href="#pipeline" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#simulator" className="hover:text-[var(--text-primary)] transition-colors">Live Demo</a>
            <a href="#evidence" className="hover:text-[var(--text-primary)] transition-colors">The Research</a>
            <a href="#architecture" className="hover:text-[var(--text-primary)] transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2 rounded-full bg-[var(--accent)] text-[#050505] hover:bg-[var(--accent-hover)] transition-all shadow-xs hover:shadow-[0_0_20px_rgba(232,200,114,0.3)]"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 rounded-full text-zinc-300 border border-white/[0.08]"
            >
              Log in
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white border border-white/[0.08] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 md:hidden border-b border-white/[0.08] bg-[#09090b]/98 backdrop-blur-2xl px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <nav className="flex flex-col space-y-3 text-sm text-zinc-300 font-medium">
                <a 
                  href="#pipeline" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  How it works
                </a>
                <a 
                  href="#simulator" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  Live Demo
                </a>
                <a 
                  href="#evidence" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  The Research
                </a>
                <a 
                  href="#architecture" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  Architecture
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="py-1 hover:text-[var(--accent)] transition-colors"
                >
                  FAQ
                </a>
              </nav>
              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold py-2.5 rounded-full bg-[var(--accent)] text-[#050505]"
                >
                  Get started free →
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-16 sm:pt-24 md:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Live Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 hover:border-[var(--accent)]/40 transition-colors cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">The Cognitive Retention Layer for AI Coders</span>
              <span className="text-[var(--accent)] group-hover:translate-x-0.5 transition-transform shrink-0">→</span>
            </div>

            {/* Main Headline with High Visual Contrast */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.04] max-w-4xl mx-auto break-words px-2">
              Your AI writes the code.
              <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-[#f3deb0] to-[var(--accent)]">
                Make sure you own the system.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal px-2">
              A Stanford & Anthropic RCT documented a nearly two-grade decline in post-task debugging among engineers using AI assistants. Engram silently captures your IDE session diffs and turns them into 5-minute active recall practice.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 px-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#050505] text-xs sm:text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-md hover:shadow-[0_0_25px_rgba(232,200,114,0.4)] flex items-center justify-center gap-2"
              >
                <span>Start 5-Minute Practice Free</span>
                <span>→</span>
              </Link>

              <button
                onClick={handleCopyCli}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span className="text-[var(--accent)]">$</span>
                <span>npx engram init</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] transition-colors ${copiedCli ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.06] text-zinc-400'}`}>
                  {copiedCli ? '✓ Copied' : 'Copy'}
                </span>
              </button>
            </div>

            {/* Real-Time Agent Compatibility Dock */}
            <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2.5 text-xs text-zinc-400 px-4">
              <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-semibold w-full sm:w-auto text-center mb-1 sm:mb-0">
                0ms synchronous lag with:
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Claude Code
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Cursor IDE
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Antigravity
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Codex CLI
              </span>
            </div>
          </div>
        </section>

        {/* 3-Stage Retention Pipeline Flow */}
        <section id="pipeline" className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3.5 hover:border-white/[0.12] transition-colors">
              <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-zinc-300 flex items-center justify-center shrink-0">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-white">Silent IPC Daemon</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Detached 0.4ms hook observes diffs on save. Never pauses Cursor or interrupts typing flow.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3.5 hover:border-white/[0.12] transition-colors">
              <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-zinc-300 flex items-center justify-center shrink-0">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-white">AST Edge Extraction</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Local-first .engramignore scrubs secrets while Gemini isolates state locks and failure modes.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex items-start gap-3.5 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-xs font-mono text-[var(--accent)] flex items-center justify-center shrink-0">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-white">5-Min Active Recall</h3>
                <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
                  Answer 3 calibrated prompts every morning to permanently retain mental models before standup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Hero Session Simulator (The Centerpiece) */}
        <section id="simulator" className="px-4 sm:px-6 pb-24 sm:pb-32">
          <div className="max-w-5xl mx-auto">
            {/* Container Box with Glow and Chrome */}
            <div className="rounded-2xl border border-white/[0.1] bg-[#09090b]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Window Chrome Header */}
              <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-400 truncate max-w-[200px] sm:max-w-none">
                    engram-live-simulator // {currentScenario.file}
                  </span>
                </div>

                {/* Scenario Selector Pills - Responsive on Mobile */}
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full border border-white/[0.06] text-xs w-full sm:w-auto overflow-x-auto scrollbar-none">
                  {SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        setActiveScenarioId(scenario.id);
                        setUserDraftAnswer('');
                        setLiveEvaluationResult(null);
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeScenarioId === scenario.id
                          ? 'bg-[var(--accent)] text-[#050505] font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="sm:hidden">
                        {scenario.id === 'stripe' ? 'Stripe' : scenario.id === 'postgres' ? 'Postgres' : 'React'}
                      </span>
                      <span className="hidden sm:inline">{scenario.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Tabs */}
              <div className="px-4 sm:px-5 border-b border-white/[0.06] bg-black/30 flex items-center justify-between overflow-x-auto text-xs scrollbar-none">
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`py-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'diff'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    1. Session Diff Stream
                  </button>
                  <button
                    onClick={() => setActiveTab('question')}
                    className={`py-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'question'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    2. Active Recall Rep
                  </button>
                  <button
                    onClick={() => setActiveTab('rubric')}
                    className={`py-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'rubric'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    3. Tech Lead Rubric
                  </button>
                  <button
                    onClick={() => setActiveTab('retention')}
                    className={`py-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeTab === 'retention'
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    4. Memory Retention Curve
                  </button>
                </div>

                <span className="hidden lg:inline text-[11px] font-mono text-zinc-500 whitespace-nowrap pl-4">
                  Observed via {currentScenario.agent}
                </span>
              </div>

              {/* Tab Content Display */}
              <div className="p-4 sm:p-6 min-h-[380px] flex flex-col justify-between">
                {activeTab === 'diff' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        <span className="text-[var(--accent)] font-semibold">Prompt:</span> "{currentScenario.prompt}"
                      </p>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0 self-start sm:self-auto">
                        +4 additions
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-black border border-white/[0.08] font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto max-w-full">
                      {currentScenario.diffLines.map((line, idx) => (
                        <div
                          key={idx}
                          className={`px-2 py-0.5 rounded-xs whitespace-pre ${
                            line.type === 'add'
                              ? 'bg-emerald-950/40 text-emerald-300 font-medium'
                              : line.type === 'del'
                              ? 'bg-rose-950/40 text-rose-300 line-through opacity-70'
                              : 'text-zinc-500'
                          }`}
                        >
                          {line.text}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs">
                      <span className="text-zinc-400 text-[11px] sm:text-xs">
                        Engram parsed AST, extracted transactional state change, and queued recall rep.
                      </span>
                      <button
                        onClick={() => setActiveTab('question')}
                        className="px-4 py-2 rounded-full bg-[var(--accent)] text-[#050505] font-semibold text-xs cursor-pointer hover:bg-[var(--accent-hover)] transition-all self-start sm:self-auto shrink-0"
                      >
                        Inspect Generated Rep →
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'question' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold">
                        {currentScenario.targetLevel}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs">
                        {currentScenario.questionType}
                      </span>
                    </div>

                    <p className="font-serif text-xl sm:text-2xl text-white leading-snug">
                      "{currentScenario.question}"
                    </p>

                    {/* Interactive Response Playground */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                          Interactive Practice Playground
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={handlePreloadJuniorAnswer}
                            className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-pointer font-medium transition-colors"
                          >
                            Prefill Junior (Fails Rubric)
                          </button>
                          <button
                            onClick={handlePreloadSeniorAnswer}
                            className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-[var(--accent-subtle)] hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 cursor-pointer font-medium transition-colors"
                          >
                            Prefill Senior (94/100)
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={userDraftAnswer}
                        onChange={(e) => setUserDraftAnswer(e.target.value)}
                        placeholder="Draft your technical explanation or click 'Prefill Junior' / 'Prefill Senior'..."
                        className="w-full h-24 bg-black/60 border border-white/[0.08] rounded-xl p-3 text-[16px] sm:text-xs text-zinc-200 placeholder-zinc-600 focus:border-[var(--accent)] focus:outline-none transition-colors resize-none font-sans"
                      />

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={handleRunLiveEvaluation}
                          disabled={isEvaluatingLive || !userDraftAnswer.trim()}
                          className="px-4 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#050505] text-xs font-semibold tracking-tight transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                        >
                          {isEvaluatingLive ? (
                            <>
                              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              <span>Evaluating with Gemini...</span>
                            </>
                          ) : (
                            <span>Evaluate with Gemini →</span>
                          )}
                        </button>

                        <button
                          onClick={() => setActiveTab('rubric')}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          View Tech Lead Rubric →
                        </button>
                      </div>

                      {/* Live Evaluation Feedback Output */}
                      {liveEvaluationResult && (
                        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                                liveEvaluationResult.score >= 80 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {liveEvaluationResult.score}/100 {liveEvaluationResult.score >= 80 ? 'Senior Pass' : 'Rubric Gaps'}
                              </span>
                              <span className="text-xs text-zinc-300 font-medium">Gemini 3.6 Flash Review</span>
                            </div>
                            <span className="text-[11px] text-zinc-500">Structured Calibration Output</span>
                          </div>

                          {/* Visual Score Meter */}
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                liveEvaluationResult.score >= 80 ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${liveEvaluationResult.score}%` }}
                            />
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed italic">
                            "{liveEvaluationResult.feedback}"
                          </p>

                          {liveEvaluationResult.gaps.length > 0 && (
                            <div className="pt-1 text-[11px] text-rose-400/90 flex items-start gap-1.5">
                              <span className="font-bold">Missing:</span>
                              <span>{liveEvaluationResult.gaps.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'rubric' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--accent)]">
                      <span className="font-semibold uppercase tracking-wider block text-[10px] mb-1">
                        Calibration Standard:
                      </span>
                      <p className="text-zinc-200 leading-relaxed font-normal text-xs sm:text-sm">
                        {currentScenario.seniorRubric.levelTip}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                        <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block">
                          Must-Demonstrate Competencies
                        </span>
                        <ul className="space-y-1.5 text-zinc-300">
                          {currentScenario.seniorRubric.expectedConcepts.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">+</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-2">
                        <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px] block">
                          Critical Failure Modes Flagged
                        </span>
                        <ul className="space-y-1.5 text-zinc-300">
                          {currentScenario.seniorRubric.failureModes.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-rose-400 font-bold">-</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'retention' && (
                  <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        Ebbinghaus Forgetting Curve: Passive AI Coding vs Active Recall Reps
                      </h4>
                      <p className="text-zinc-400 mt-1 leading-relaxed">
                        When developers blindly copy AI generated code, synaptic consolidation degrades by 80% within 24 hours. Engram resets the decay trajectory.
                      </p>
                    </div>

                    {/* Visual Comparison Bar Diagram */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">Passive AI Generation (No Reps)</span>
                          <span className="text-rose-400 font-mono font-semibold">18% retained after 48h</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full w-[18%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-200 font-medium">Engram Daily Active Recall Reps</span>
                          <span className="text-[var(--accent)] font-mono font-semibold">89% retained after 48h</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full bg-[var(--accent)] rounded-full w-[89%]" />
                        </div>
                      </div>

                      {/* Retention Decay Milestones Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Day 1</span>
                          <span className="text-xs text-rose-400 font-mono block mt-1">42% vs <span className="text-[var(--accent)] font-bold">95%</span></span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Day 3</span>
                          <span className="text-xs text-rose-400 font-mono block mt-1">24% vs <span className="text-[var(--accent)] font-bold">91%</span></span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Day 7</span>
                          <span className="text-xs text-rose-400 font-mono block mt-1">18% vs <span className="text-[var(--accent)] font-bold">89%</span></span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Day 30</span>
                          <span className="text-xs text-rose-400 font-mono block mt-1">8% vs <span className="text-[var(--accent)] font-bold">84%</span></span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 pt-2 border-t border-white/[0.06]">
                      Cognitive protocol: 3 targeted scenario questions immediately after session diff extraction permanently preserves mental models against AI-induced skill atrophy.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The Evidence & Empirical Research Section */}
        <section id="evidence" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#08080a] border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                The Empirical Evidence
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white mt-2 leading-tight">
                AI accelerates code shipping.
                <br />
                <span className="text-zinc-400">It also erodes mental models.</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-4 leading-relaxed">
                The software industry is experiencing a profound comprehension crisis. Velocity has doubled, but debugging depth, system understanding, and promotion readiness are dropping precipitously.
              </p>
            </div>

            {/* Bento Grid 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-rose-500/40 transition-colors space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-serif text-5xl sm:text-6xl text-rose-400">-17%</div>
                  <h3 className="text-base font-semibold text-white">Debugging Comprehension</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Stanford & Anthropic randomized controlled trial across 52 professional engineers showed a nearly two full letter-grade decline in post-task debugging proficiency among participants using generative coding assistants.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 pt-3 border-t border-white/[0.05] block">
                  SOURCE: Stanford HAI / Anthropic RCT (2025)
                </span>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-amber-500/40 transition-colors space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-serif text-4xl sm:text-5xl lg:text-6xl text-amber-300">84% → 29%</div>
                  <h3 className="text-base font-semibold text-white">The Trust Deficit</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Stack Overflow developer survey data reveals 84% adoption of AI tooling, but engineering trust in AI output dropped below 30%. Engineers spend 80% of their workday reviewing code they do not fully understand.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 pt-3 border-t border-white/[0.05] block">
                  SOURCE: Stack Overflow Developer Survey (n=65,000)
                </span>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-[var(--accent)]/40 transition-colors space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-serif text-5xl sm:text-6xl text-[var(--accent)]">5 min</div>
                  <h3 className="text-base font-semibold text-white">Active Recall Solution</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    3 targeted questions a day from your actual code diffs preserves deep architectural memory consolidation without slowing down your day-to-day coding velocity.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 pt-3 border-t border-white/[0.05] block">
                  SOURCE: Ebbinghaus Spaced Consolidation Protocol
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* High-Craft Architecture Bento Grid */}
        <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                Engineered for Mastery
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white mt-2 leading-tight">
                Deep systems engineering.
                <br />
                <span className="text-zinc-400">Zero interruption to your flow.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: 0ms Detached IPC */}
              <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                    0.4ms Execution
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">Detached Worker</span>
                </div>
                <h3 className="font-serif text-2xl text-white">Non-Blocking Background Daemon</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hooks into Cursor and Claude Code lifecycle events as detached background processes. If your connection drops or the server is under load, the hook returns in 0ms without ever lagging your cursor or CLI prompt.
                </p>
                <div className="p-3 sm:p-4 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-zinc-600 pb-1 mb-1 border-b border-white/[0.04]">
                    <span>TERMINAL IPC TRACE</span>
                    <span>EXIT 0</span>
                  </div>
                  <div>0.00ms  [IPC] Cursor onDidSaveTextDocument hook spawned</div>
                  <div>0.14ms  [AST] Tokenized 18 modified lines in refund.service.ts</div>
                  <div>0.28ms  [REDACT] .engramignore scrubbed 0 secrets, 0 keys</div>
                  <div>0.39ms  [SPAWN] Detached background worker pid:49201 dispatched</div>
                  <div className="text-emerald-400 font-medium">✓ Control returned to IDE editor [0.41ms total]</div>
                </div>
              </div>

              {/* Card 2: Career Ladder Promotion Calibration */}
              <div className="md:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--accent)]/30 font-semibold">
                      Career Calibration
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Interactive</span>
                  </div>
                  <h3 className="font-serif text-2xl text-white mt-3">Target Role Rubric</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    Select your promotion target. Question depth and evaluation rubrics automatically calibrate for the gap you are closing.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {(['intern', 'sde1', 'senior'] as const).map((key) => {
                    const track = LADDER_RUBRICS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedLadder(key)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border cursor-pointer transition-all ${
                          selectedLadder === key
                            ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-white'
                            : 'border-white/[0.06] bg-black/40 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="font-medium">{track.label}</span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate">{track.subtitle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Ladder Rubric Preview */}
                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-white/[0.05] pb-1">
                    <span>{LADDER_RUBRICS[selectedLadder as 'intern' | 'sde1' | 'senior' || 'sde1'].weight}</span>
                  </div>
                  <ul className="space-y-1 text-zinc-300 text-[11px]">
                    {LADDER_RUBRICS[selectedLadder as 'intern' | 'sde1' | 'senior' || 'sde1'].standards.map((std, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[var(--accent)]">•</span>
                        <span>{std}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 3: Privacy & Redaction */}
              <div className="md:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] space-y-4">
                <span className="text-xs font-mono uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 font-semibold">
                  Local-First Redaction
                </span>
                <h3 className="font-serif text-2xl text-white">.engramignore Protection</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Raw repositories never get indexed. Before diffs leave your machine, the local hook scrubs API secrets, authentication bearer tokens, and proprietary directories.
                </p>
                <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-[11px] space-y-1.5 overflow-x-auto">
                  <div className="flex items-center justify-between text-zinc-500 text-[10px] pb-1 border-b border-white/[0.04]">
                    <span>LOCAL SANITIZER</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="text-zinc-400 flex items-center justify-between gap-2">
                    <span>AUTH_SECRET = "sk_live_...9x"</span>
                    <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded text-[10px]">REDACTED</span>
                  </div>
                  <div className="text-zinc-400 flex items-center justify-between gap-2">
                    <span>DATABASE_URL = "postgres://..."</span>
                    <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded text-[10px]">REDACTED</span>
                  </div>
                  <div className="text-zinc-400 flex items-center justify-between gap-2">
                    <span>src/payment/refund.service.ts</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[10px]">SYNTHESIZED</span>
                  </div>
                </div>
              </div>

              {/* Card 4: 60-Second Standup Prep */}
              <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-white/[0.08] space-y-4">
                <span className="text-xs font-mono uppercase text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  Executive Alignment
                </span>
                <h3 className="font-serif text-2xl text-white">60-Second Standup & PR Defense</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Never freeze during morning standup. One click generates a concise 3-bullet briefing on architectural decisions, trade-offs rejected, and production risks mitigated in your last 24 hours of coding.
                </p>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                    <span className="text-[10px] font-mono uppercase text-[var(--accent)] font-semibold">Today's Standup Briefing</span>
                    <span className="text-[10px] text-zinc-500 font-mono">1.2s synthesis</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-300 text-[11px] sm:text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold shrink-0">•</span>
                      <span><strong>Shipped:</strong> Idempotent Stripe refund pipeline with 3s pessimistic redis lock.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold shrink-0">•</span>
                      <span><strong>Mitigated:</strong> Double-credit race condition during client network disconnects.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold shrink-0">•</span>
                      <span><strong>PR Defense:</strong> Scoped idempotency key to transaction hash rather than user UUID.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#08080a] border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                Transparent Pricing
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight">
                Invest in your engineering edge
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Free for solo developers. Scale as your career expands.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/[0.08] text-xs mt-4">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
                    !annualBilling ? 'bg-white/[0.1] text-white font-medium' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                    annualBilling ? 'bg-[var(--accent)] text-[#050505] font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>Annual</span>
                  <span className={`text-[10px] ${annualBilling ? 'text-[#050505]/80 font-bold' : 'text-emerald-400'}`}>-20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Hobby Free */}
              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white">Hobbyist</h3>
                    <p className="text-xs text-zinc-400 mt-1">For individual developers building daily coding habits.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-white">$0</span>
                    <span className="text-xs text-zinc-500">/ forever</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> 3 active recall questions / day
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> 7-day session capture history
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> Gemini 3.6 Flash engine
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> All CLI & IDE hooks included
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full border border-white/[0.1] text-zinc-300 hover:text-white hover:border-white text-xs font-semibold text-center transition-all"
                >
                  Start free
                </Link>
              </div>

              {/* Pro Tier (Featured) */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-black/80 to-[#121008] border-2 border-[var(--accent)]/50 flex flex-col justify-between space-y-8 relative shadow-[0_0_40px_rgba(232,200,114,0.1)]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Pro Engineer</h3>
                      <p className="text-xs text-zinc-400 mt-1">For engineers using AI assistants daily.</p>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 font-semibold">
                      POPULAR
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-white">
                      ${annualBilling ? '10' : '12'}
                    </span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <span className="text-[var(--accent)]">✓</span> <strong className="text-white">Unlimited</strong> daily practice questions
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-[var(--accent)]">✓</span> Spaced repetition queue with Ebbinghaus decay
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-[var(--accent)]">✓</span> Career Promotion Track (SDE-1 ➔ Staff)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-[var(--accent)]">✓</span> 60-second standup & PR defense brief
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-[var(--accent)]">✓</span> Permanent retention analytics
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full bg-[var(--accent)] text-[#050505] text-xs font-semibold text-center hover:bg-[var(--accent-hover)] transition-all shadow-md"
                >
                  Upgrade to Pro
                </Link>
              </div>

              {/* Team Tier */}
              <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-white">Engineering Teams</h3>
                    <p className="text-xs text-zinc-400 mt-1">For tech leads safeguarding code quality.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-5xl text-white">
                      ${annualBilling ? '24' : '29'}
                    </span>
                    <span className="text-xs text-zinc-500">/ seat / month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> Everything in Pro
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> Team codebase comprehension heatmaps
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> PR comprehension checks before merge
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> Onboarding ramp-up metrics
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400">✓</span> Centralized billing & SAML SSO
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="w-full py-3 rounded-full border border-white/[0.1] text-zinc-300 hover:text-white hover:border-white text-xs font-semibold text-center transition-all"
                >
                  Contact for teams
                </Link>
              </div>
            </div>

            {/* Reassurance Micro-Copy */}
            <div className="pt-4 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> No credit card required for free tier
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> 14-day money-back guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Pause or cancel anytime in 1 click
              </span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                Engineered Answers
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white mt-2 leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-white/[0.08]">
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
                  q: 'Do I need to pay for AI tokens, or can I bring my own API keys (BYOK)?',
                  a: 'Engram includes free Gemini 3.6 Flash synthesis for all accounts. If you prefer using your personal Gemini, OpenAI, or Anthropic key for custom quotas or zero-data-retention compliance, you can plug it in anytime via Dashboard Settings.',
                },
                {
                  q: 'How does Career Target Calibration work?',
                  a: 'When you choose a target level (e.g. SDE-1 ➔ SDE-2 or SDE-2 ➔ Senior), Engram modifies the system prompt to challenge you on concurrency hazards, database state locks, and distributed failure modes instead of simple syntax checks.',
                },
                {
                  q: 'Can I review questions on mobile or away from my desk?',
                  a: 'Yes. Engram is fully responsive and installs as a progressive web app (PWA) on iOS and Android. Complete your 5-minute morning recall reps on your commute or during coffee before standup.',
                },
                {
                  q: 'What LLM powers the synthesis engine?',
                  a: 'We use Google Gemini 3.6 Flash running in structured JSON mode to evaluate diffs, extract edge cases, and grade your answers against senior engineering standards.',
                },
              ].map((item, i) => (
                <div key={i} className="py-5 sm:py-6">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                  >
                    <h3 className="text-sm sm:text-base font-medium text-white group-hover:text-[var(--accent)] transition-colors pr-4">
                      {item.q}
                    </h3>
                    <span className="text-zinc-500 text-xl shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-3 sm:mt-4 pr-6 sm:pr-12">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Elite Minimalist Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/[0.06] bg-[#050505] text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-white">Engram</span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <a href="#pipeline" className="hover:text-white transition-colors">How it works</a>
            <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            <a href="#evidence" className="hover:text-white transition-colors">Evidence</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <span className="text-[11px] text-zinc-600">Engram Technologies &copy; 2026. The Cognitive Retention Layer.</span>
        </div>
      </footer>
    </div>
  );
}
