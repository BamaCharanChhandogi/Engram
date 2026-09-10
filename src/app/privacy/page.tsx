import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Engram',
  description: 'Privacy Policy and Data Handling Practices for Engram',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] px-6 py-16 selection:bg-[#e8c872]/20 selection:text-[#e8c872]">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-[#1a1a1a]">
          <Link href="/" className="font-serif text-2xl text-[#ededed] hover:text-[#e8c872] transition-colors">
            Engram
          </Link>
          <h1 className="font-serif text-4xl text-[#ededed] pt-2">Privacy Policy</h1>
          <p className="text-xs text-[#888888] font-mono">Last updated: September 10, 2026</p>
        </div>

        {/* Introduction */}
        <section className="space-y-3 text-sm text-[#888888] leading-relaxed">
          <p>
            Engram ("we", "our", or "us") provides an active recall engineering retention platform and developer devtools.
            This Privacy Policy explains how we collect, use, and protect your information across our web dashboard, mobile applications,
            and background agent integrations.
          </p>
        </section>

        {/* Data We Collect */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#ededed]">1. Information We Collect</h2>
          <div className="space-y-3 text-sm text-[#888888] leading-relaxed">
            <p><strong className="text-[#ededed]">Account Credentials:</strong> When you register, we collect your name, email address, and encrypted password hash (or OAuth profile metadata if authenticating via GitHub).</p>
            <p><strong className="text-[#ededed]">Developer Session Telemetry:</strong> To generate contextual active recall questions, our agent hooks (OpenAI Codex, Cursor, Claude Code) collect code diffs, file modification summaries, and tool prompts from your designated development workspaces.</p>
            <p><strong className="text-[#ededed]">Practice & Performance Data:</strong> Your answers to daily quizzes, self-evaluations, streak history, and career promotion targets are stored to track learning retention.</p>
          </div>
        </section>

        {/* Data We Never Collect */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#ededed]">2. Information We Never Collect</h2>
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-[#888888] space-y-2">
            <p>• We do <strong className="text-[#ededed]">not</strong> access personal contacts, biometric raw records, or camera sensors.</p>
            <p>• We do <strong className="text-[#ededed]">not</strong> track background geolocation.</p>
            <p>• We do <strong className="text-[#ededed]">not</strong> sell, rent, or trade your source code, diffs, or personal data to third-party advertising networks.</p>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#ededed]">3. Purpose of Processing</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#888888] leading-relaxed">
            <li>Generate personalized technical active recall questions matching your career promotion ladder (SDE-1, SDE-2, Senior, Staff).</li>
            <li>Audit prompt hygiene, context density, and security risks to prevent credential leakage.</li>
            <li>Formulate 60-second Standup and PR defense briefs from daily coding milestones.</li>
          </ul>
        </section>

        {/* Data Security & Encryption */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#ededed]">4. Data Security</h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            All data in transit is encrypted using industry-standard TLS/HTTPS protocols. Data at rest is secured in managed PostgreSQL database clusters with strict relational isolation.
          </p>
        </section>

        {/* User Rights & Account Deletion */}
        <section className="space-y-4" id="account-deletion">
          <h2 className="text-lg font-semibold text-[#ededed]">5. Your Rights & Account Deletion</h2>
          <div className="space-y-3 text-sm text-[#888888] leading-relaxed">
            <p>
              In full compliance with Google Play Developer Policies and global privacy regulations, you have the right to access, rectify, and delete your account and all associated data at any time.
            </p>
            <p>
              You can instantly purge your account within the mobile app via <strong className="text-[#ededed]">Settings → Delete Account</strong>, or via our web request portal at{' '}
              <Link href="/delete-account" className="text-[#e8c872] hover:underline font-medium">
                engram.bamacharan.com/delete-account
              </Link>.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-3 pt-6 border-t border-[#1a1a1a] text-xs text-[#555555]">
          <p>For privacy inquiries or compliance requests, contact: <span className="text-[#888888]">b.c.chhandogi@gmail.com</span></p>
          <div className="pt-2">
            <Link href="/" className="text-[#e8c872] hover:underline">← Return to Engram Home</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
