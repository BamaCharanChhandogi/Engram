'use client';

import { useState, useEffect } from 'react';
import HeatmapCalendar from '@/components/HeatmapCalendar';

export default function StreakPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/streak');
        if (res.ok) {
          const data = await res.json();
          
          const dateMap: Record<string, { totalScore: number; count: number }> = {};
          (data.history || []).forEach((item: any) => {
            const d = new Date(item.date).toISOString().split('T')[0];
            if (!dateMap[d]) {
              dateMap[d] = { totalScore: 0, count: 0 };
            }
            dateMap[d].totalScore += item.score || 0;
            dateMap[d].count += 1;
          });

          const heatmapData = Object.entries(dateMap).map(([date, val]) => ({
            date,
            score: Math.round(val.totalScore / val.count),
            count: val.count,
          }));

          setStats({
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            totalAnswered: data.totalQuestionsAnswered || 0,
            heatmapData,
            history: data.history || [],
          });
        }
      } catch (err) {
        console.error('Failed to load streak stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]"></div>)}
        </div>
        <div className="h-48 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]"></div>
      </div>
    );
  }

  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const totalAnswered = stats?.totalAnswered || 0;
  const heatmapData = stats?.heatmapData || [];
  const historyList = stats?.history || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
            Performance Metrics
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text-primary)]">Consistency & Recall History</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Spaced repetition retention rate based on daily practice reps.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
            <span>Current Streak</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
          </div>
          <div className="font-serif text-4xl text-[var(--text-primary)]">
            {currentStreak} <span className="text-xs font-normal text-[var(--text-secondary)] font-sans">{currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Daily practice active</p>
        </div>

        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
            <span>Longest Streak</span>
            <span className="text-[var(--text-tertiary)] text-xs font-medium">HIGH</span>
          </div>
          <div className="font-serif text-4xl text-[var(--text-primary)]">
            {longestStreak} <span className="text-xs font-normal text-[var(--text-secondary)] font-sans">{longestStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Historical personal best</p>
        </div>

        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
            <span>Questions Solved</span>
            <span className="text-[var(--text-tertiary)] text-xs font-medium">CUMULATIVE</span>
          </div>
          <div className="font-serif text-4xl text-[var(--text-primary)]">
            {totalAnswered}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Active recall reps completed</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Practice Frequency Matrix
          </h2>
          <span className="text-xs text-[var(--text-tertiary)]">Trailing 5 weeks</span>
        </div>
        <HeatmapCalendar data={heatmapData} />
      </div>

      {/* Past Answers History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
          <span>Audit Log • Past Reps</span>
          <span>{historyList.length} recorded</span>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">No answered questions on record. Submit your first rep in Today's Practice.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historyList.map((item: any, idx: number) => {
              const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const score = item.score ?? 0;
              return (
                <div 
                  key={idx} 
                  className="bg-[var(--bg-surface)] px-4 py-3 rounded-xl border border-[var(--border)] flex items-center justify-between hover:border-[var(--border-focus)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-secondary)]">{formattedDate}</span>
                    <span className="text-sm text-[var(--text-primary)] font-medium">Session Evaluation Recorded</span>
                  </div>
                  <div className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    score >= 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {score}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
