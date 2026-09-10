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
    if (count === 0) return '#111111';
    if (score < 40) return '#064e3b';
    if (score < 70) return '#047857';
    if (score < 85) return '#10b981';
    return '#34d399';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 text-[11px] text-[var(--text-tertiary)] pr-2 select-none">
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
                    className="w-3.5 h-3.5 rounded-xs relative group cursor-pointer border border-[var(--border)] hover:border-[var(--border-focus)] transition-colors"
                    style={{ backgroundColor: getColor(day.score, day.count) }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-[var(--border)] shadow-xl">
                      <span className="font-semibold text-[var(--text-primary)]">{day.date}</span>
                      <span className="text-[var(--text-secondary)] block text-[11px]">
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
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border)]">
        <span>35-day activity window</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[#111111] border border-[var(--border)]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#064e3b]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#047857]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[#34d399]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
