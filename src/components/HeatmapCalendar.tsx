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
    if (count === 0) return '#18181b'; // zinc-900
    if (score < 40) return '#064e3b'; // emerald-900
    if (score < 70) return '#047857'; // emerald-700
    if (score < 85) return '#10b981'; // emerald-500
    return '#34d399'; // emerald-400
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-500 pr-2 select-none">
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
                    className="w-3.5 h-3.5 rounded-xs relative group cursor-pointer border border-zinc-800/80 hover:border-zinc-500 transition-colors"
                    style={{ backgroundColor: getColor(day.score, day.count) }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900 text-[11px] font-mono text-zinc-200 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-zinc-700/80 shadow-lg">
                      <span className="font-semibold text-zinc-100">{day.date}</span>
                      <span className="text-zinc-400 block text-[10px]">
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
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/40">
        <span>35-day activity window</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[#18181b] border border-zinc-800" />
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
