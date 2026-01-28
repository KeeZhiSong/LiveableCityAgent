const BAR_COLORS = {
  high: 'bg-leaf',
  mid: 'bg-amber-400',
  low: 'bg-rose-400',
};

function getBarColor(score) {
  if (score >= 70) return BAR_COLORS.high;
  if (score >= 50) return BAR_COLORS.mid;
  return BAR_COLORS.low;
}

export default function MetricBars({ metrics }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">City-Wide Metric Averages</h3>
      {metrics.map((m) => {
        const avg = Math.round(m.avg);
        return (
          <div key={m.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">{m.label} <span className="text-text-muted">({Math.round(m.weight * 100)}% weight)</span></span>
              <span className="text-text-primary font-medium tabular-nums">{avg}</span>
            </div>
            <div className="h-2 bg-forest-light/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getBarColor(avg)}`}
                style={{ width: `${avg}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
