'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        
        if (!signInRes?.error) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed. Please retry.');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs shadow-indigo-500/20">
          //
        </div>
        <span className="font-semibold text-lg tracking-tight text-zinc-100 group-hover:text-white transition-colors">
          DevPractice
        </span>
      </Link>
      
      <div className="w-full max-w-sm bg-[#121215] p-8 rounded-lg border border-zinc-800 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Create DevPractice Account</h1>
          <p className="text-xs text-zinc-400">Join the active recall layer for AI engineers</p>
        </div>

        {/* GitHub OAuth Button */}
        <button
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-2.5 bg-zinc-100 hover:bg-white text-zinc-900 py-2.5 px-4 rounded-md text-xs font-semibold tracking-tight transition-colors cursor-pointer shadow-xs"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Continue with GitHub</span>
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink-0 mx-3 text-zinc-500 text-[11px] font-mono uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/50 text-rose-300 p-2.5 rounded-md text-xs font-mono">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-xs font-mono text-zinc-400 uppercase">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Ada Lovelace"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-zinc-400 uppercase">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="engineer@company.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-zinc-400 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-zinc-400 uppercase">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-md text-xs font-medium tracking-tight transition-colors disabled:opacity-60 cursor-pointer pt-2 shadow-xs shadow-indigo-500/20"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 font-mono pt-1">
          Already registered? <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
