'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  {
    href: '/dashboard',
    label: "Today's Practice",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </svg>
    ),
  },
  {
    href: '/dashboard/streak',
    label: 'Streak & History',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    href: '/dashboard/feedback',
    label: 'Prompt Quality',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Agent Integrations',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden px-4 py-3 flex justify-between items-center border-b border-[var(--border)] bg-[#0c0c0e]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs">
            //
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">Engram</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Main Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0c0c0e] border-r border-zinc-800/80 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Brand Logo */}
          <div className="px-5 py-5 border-b border-zinc-800/60">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm shadow-indigo-500/20">
                //
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                  Engram
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Memory Layer
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 mb-2 font-medium">
              Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-800/80 text-white border border-zinc-700/60 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className={isActive ? 'text-indigo-400' : 'text-zinc-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-zinc-800/60 bg-[#09090b]">
          {session?.user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-zinc-900/50 border border-zinc-800/40">
                <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-mono font-medium text-zinc-200 border border-zinc-700/60 shrink-0">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'D'}
                </div>
                <div className="text-xs overflow-hidden leading-tight flex-1">
                  <p className="font-medium text-zinc-200 truncate">{session.user.name || 'Developer'}</p>
                  <p className="text-[11px] text-zinc-500 font-mono truncate">{session.user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })} 
                className="w-full py-1.5 px-2.5 rounded-md text-xs font-mono text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Disconnect</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="block w-full py-2 px-3 rounded-md text-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
