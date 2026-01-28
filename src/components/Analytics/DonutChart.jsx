const CIRCUMFERENCE = 2 * Math.PI * 70; // r=70

const COLORS = [
  '#3b82f6', // Air Quality - blue
  '#6366f1', // Transport - indigo
  '#22c55e', // Green Space - green
  '#f59e0b', // Amenities - amber
  '#ef4444', // Safety - red
];

export default function DonutChart({ deficits, centerValue }) {
  const total = deficits.reduce((s, d) => s + d.deficit, 0);
  if (total === 0) return null;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 180 180" className="w-48 h-48">
        {deficits.map((d, i) => {
          const segLen = (d.deficit / total) * CIRCUMFERENCE;
          const offset = -cumulative;
          cumulative += segLen;
          return (
            <circle
              key={d.key}
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={COLORS[i]}
              strokeWidth="28"
              strokeDasharray={`${segLen} ${CIRCUMFERENCE - segLen}`}
              strokeDashoffset={offset}
              className="transition-all duration-700"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
            />
          );
        })}
        {/* Center text */}
        <text x="90" y="82" textAnchor="middle" className="fill-text-primary text-2xl font-bold" fontSize="28">
          {centerValue}
        </text>
        <text x="90" y="102" textAnchor="middle" className="fill-text-muted" fontSize="10">
          City Avg
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-1.5 w-full">
        {deficits.map((d, i) => {
          const pct = total > 0 ? Math.round((d.deficit / total) * 100) : 0;
          return (
            <div key={d.key} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="flex-1 text-text-secondary">{d.label}</span>
              <span className="text-text-muted tabular-nums">{pct}%</span>
              <span className="text-text-muted tabular-nums w-10 text-right">avg {Math.round(d.avg)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
