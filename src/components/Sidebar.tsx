'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import QuickTargetModal, { TARGET_OPTIONS } from '@/components/QuickTargetModal';

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
    href: '/dashboard/profile',
    label: 'Career Target',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
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
  const [currentTarget, setCurrentTarget] = useState('sde2');
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.targetLevel) {
            setCurrentTarget(data.targetLevel);
          }
        })
        .catch(() => {});
    }
  }, [session?.user]);

  const activeTargetObj = TARGET_OPTIONS.find((t) => t.id === currentTarget) || TARGET_OPTIONS[1];

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <div className="sticky top-0 z-40 md:hidden px-4 py-3.5 flex justify-between items-center border-b border-[var(--border)] bg-[#09090b]/90 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl tracking-tight text-[var(--text-primary)]">Engram</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[var(--bg-surface)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Logo */}
          <div className="px-5 py-5 border-b border-[var(--border)] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Engram
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] px-3 mb-2 font-mono">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] border border-[var(--accent)]/30 shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Account / Footer with protective bottom padding */}
        <div className="p-3 pb-8 md:pb-6 border-t border-[var(--border)] bg-[var(--bg-primary)] shrink-0">
          {session?.user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                <div className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center text-xs font-medium text-[var(--text-primary)] shrink-0 font-mono">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'D'}
                </div>
                <div className="text-xs overflow-hidden leading-tight flex-1">
                  <p className="font-medium text-[var(--text-primary)] truncate">{session.user.name || 'Developer'}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate font-mono">{session.user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(true)}
                className="w-full py-1.5 px-3 rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)] border border-[var(--border)] transition-colors flex items-center justify-between cursor-pointer group bg-[var(--bg-surface)]"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span className="text-[var(--text-tertiary)]">Target:</span>
                  <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent)] truncate">
                    {activeTargetObj.label}
                  </span>
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium shrink-0 ml-1">Switch →</span>
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })} 
                className="w-full py-1.5 px-3 rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Disconnect</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="block w-full py-2 px-3 rounded-full text-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#050505] text-xs font-semibold transition-colors shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Quick Target Ladder Modal */}
      <QuickTargetModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        currentTarget={currentTarget}
        onTargetUpdated={(newTarget) => setCurrentTarget(newTarget)}
      />
    </>
  );
}
