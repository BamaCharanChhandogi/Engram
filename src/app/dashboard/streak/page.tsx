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
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#121215] rounded-lg border border-zinc-800"></div>)}
        </div>
        <div className="h-48 bg-[#121215] rounded-lg border border-zinc-800"></div>
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
      <div className="pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Performance Metrics
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Consistency & Recall History</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Spaced repetition retention rate based on daily practice reps.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121215] p-5 rounded-lg border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Current Streak</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {currentStreak} <span className="text-xs font-normal text-zinc-500 font-sans">{currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="text-[11px] text-zinc-500">Daily practice active</p>
        </div>

        <div className="bg-[#121215] p-5 rounded-lg border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Longest Streak</span>
            <span className="text-zinc-600 font-mono text-xs">HIGH</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {longestStreak} <span className="text-xs font-normal text-zinc-500 font-sans">{longestStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="text-[11px] text-zinc-500">Historical personal best</p>
        </div>

        <div className="bg-[#121215] p-5 rounded-lg border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Questions Solved</span>
            <span className="text-zinc-600 font-mono text-xs">CUMULATIVE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {totalAnswered}
          </div>
          <p className="text-[11px] text-zinc-500">Active recall reps completed</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-[#121215] p-6 rounded-lg border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono text-xs">
            Practice Frequency Matrix
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Trailing 5 weeks</span>
        </div>
        <HeatmapCalendar data={heatmapData} />
      </div>

      {/* Past Answers History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <span>Audit Log // Past Reps</span>
          <span>{historyList.length} recorded</span>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-12 bg-[#121215] rounded-lg border border-zinc-800/80">
            <p className="text-xs text-zinc-500 font-mono">No answered questions on record. Submit your first rep in Today's Practice.</p>
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
                  className="bg-[#121215] px-4 py-3 rounded-md border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">{formattedDate}</span>
                    <span className="text-xs text-zinc-300 font-medium">Session Evaluation Recorded</span>
                  </div>
                  <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
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
