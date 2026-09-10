'use client';

interface HeatmapData {
  date: string;
  score: number;
  count: number;
}

interface HeatmapProps {
  data: HeatmapData[];
}

export default function HeatmapCalendar({ data }: HeatmapProps) {
  // Generate last 35 days (5 full weeks of 7 days)
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const dateStr = d.toISOString().split('T')[0];
    const match = data?.find(x => x.date === dateStr);
    return {
      date: dateStr,
      score: match ? match.score : 0,
      count: match ? match.count : 0,
    };
  });

  const getColor = (score: number, count: number) => {
    if (count === 0) return '#121214';
    if (score < 40) return 'rgba(232, 200, 114, 0.2)';
    if (score < 70) return 'rgba(232, 200, 114, 0.45)';
    if (score < 85) return 'rgba(232, 200, 114, 0.75)';
    return '#e8c872';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 text-[11px] text-[var(--text-tertiary)] pr-2 select-none font-mono">
          <div className="h-3.5 leading-3.5">M</div>
          <div className="h-3.5 leading-3.5">W</div>
          <div className="h-3.5 leading-3.5">F</div>
        </div>
        
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1.5">
              {Array.from({ length: 7 }).map((_, rowIndex) => {
                const dayIndex = colIndex * 7 + rowIndex;
                const day = days[dayIndex];
                if (!day) return null;
                
                return (
                  <div
                    key={rowIndex}
                    className="w-3.5 h-3.5 rounded-xs relative group cursor-pointer border border-white/[0.04] hover:border-[var(--accent)] transition-colors"
                    style={{ backgroundColor: getColor(day.score, day.count) }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#09090b] text-xs text-[var(--text-primary)] rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-white/[0.1] shadow-2xl">
                      <span className="font-semibold text-white font-mono">{day.date}</span>
                      <span className="text-zinc-400 block text-[11px] mt-0.5">
                        {day.count > 0 ? `${day.count} rep${day.count > 1 ? 's' : ''} • ${day.score}% avg score` : '0 reps completed'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border)] font-mono">
        <span>35-day activity window</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[#121214] border border-white/[0.06]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#e8c872]/20" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#e8c872]/45" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#e8c872]/75" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#e8c872]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
