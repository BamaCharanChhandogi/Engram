'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password credentials.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 selection:bg-[var(--accent)]/20 selection:text-[var(--accent)]">
      <Link href="/" className="mb-8 group">
        <span className="font-serif text-3xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
          Engram
        </span>
      </Link>
      
      <div className="w-full max-w-sm bg-[var(--bg-surface)] p-8 rounded-xl border border-[var(--border)] shadow-2xl space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[var(--text-primary)]">Sign in to Engram</h1>
          <p className="text-sm text-[var(--text-secondary)]">Retain your engineering edge with active recall</p>
        </div>

        {/* GitHub OAuth Button */}
        <button
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-2.5 bg-[#ededed] hover:bg-white text-[#050505] py-2.5 px-4 rounded-full text-sm font-semibold tracking-tight transition-colors cursor-pointer shadow-xs"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Continue with GitHub</span>
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink-0 mx-3 text-[var(--text-tertiary)] text-xs font-medium">or email</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] p-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              placeholder="engineer@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#050505] py-2.5 px-4 rounded-full text-sm font-semibold tracking-tight transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {isLoading ? 'Authenticating...' : 'Sign in with password'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] pt-1">
          New to Engram? <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">Register account</Link>
        </p>
      </div>
    </div>
  );
}
