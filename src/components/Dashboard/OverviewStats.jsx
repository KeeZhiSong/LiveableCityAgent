import { useMemo, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, AlertTriangle, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewStats({ districtScores, onDistrictSelect }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState('liveability');

  const stats = useMemo(() => {
    const entries = Object.entries(districtScores || {})
      .filter(([, v]) => v?.overall != null)
      .map(([name, data]) => ({ name, score: data.overall, envScore: data.envScore ?? null }))
      .sort((a, b) => b.score - a.score);

    if (entries.length === 0) return null;

    const scores = entries.map((e) => e.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const above80 = entries.filter((e) => e.score >= 80).length;
    const below50 = entries.filter((e) => e.score < 50).length;

    const envEntries = entries.filter((e) => e.envScore != null);
    const envAvg = envEntries.length > 0 ? Math.round(envEntries.reduce((s, e) => s + e.envScore, 0) / envEntries.length) : null;
    const envSorted = [...envEntries].sort((a, b) => b.envScore - a.envScore);
    const envTop = envSorted[0] || null;
    const envBottom = envSorted[envSorted.length - 1] || null;
    const hasEnv = envAvg != null;

    return { entries, avg, top: entries[0], bottom: entries[entries.length - 1], above80, below50, envAvg, envTop, envBottom, hasEnv };
  }, [districtScores]);

  if (!stats) return null;

  const handleClick = (name) => {
    onDistrictSelect?.(name);
  };

  const envSorted = stats.hasEnv
    ? [...stats.entries].sort((a, b) => (b.envScore ?? 0) - (a.envScore ?? 0))
    : [];
  const displayed = showAll ? (view === 'environmental' ? envSorted : stats.entries) : (view === 'environmental' ? envSorted : stats.entries).slice(0, 10);

  return (
    <div className="space-y-4">
      {/* View toggle */}
      {stats.hasEnv && (
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-forest/50 border border-forest-light/20">
          <button
            onClick={() => setView('liveability')}
            className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              view === 'liveability' ? 'bg-forest-light/30 text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >Liveability</button>
          <button
            onClick={() => setView('environmental')}
            className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              view === 'environmental' ? 'bg-teal/20 text-teal' : 'text-text-muted hover:text-text-secondary'
            }`}
          >Environmental</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        {view === 'liveability' ? (<>
          <SummaryCard label="Avg Score" value={stats.avg} icon={<TrendingUp className="w-4 h-4 text-teal" />} />
          <SummaryCard label="Above 80" value={stats.above80} sub={`of ${stats.entries.length}`} icon={<TrendingUp className="w-4 h-4 text-leaf" />} />
          <SummaryCard label="Top District" value={stats.top.name} sub={`Score: ${stats.top.score}`} icon={<Trophy className="w-4 h-4 text-leaf" />} />
          <SummaryCard label="Needs Help" value={stats.bottom.name} sub={`Score: ${stats.bottom.score}`} icon={<AlertTriangle className="w-4 h-4 text-rose-400" />} />
        </>) : (<>
          <SummaryCard label="Avg Env Score" value={stats.envAvg} icon={<Leaf className="w-4 h-4 text-teal" />} />
          <SummaryCard label="Districts" value={stats.entries.filter(e => e.envScore != null).length} icon={<TrendingUp className="w-4 h-4 text-leaf" />} />
          <SummaryCard label="Greenest" value={stats.envTop?.name || 'N/A'} sub={stats.envTop ? `Score: ${stats.envTop.envScore}` : undefined} icon={<Leaf className="w-4 h-4 text-leaf" />} />
          <SummaryCard label="Most At Risk" value={stats.envBottom?.name || 'N/A'} sub={stats.envBottom ? `Score: ${stats.envBottom.envScore}` : undefined} icon={<AlertTriangle className="w-4 h-4 text-rose-400" />} />
        </>)}
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl bg-forest/50 border border-forest-light/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-forest-light/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">District Leaderboard</h3>
          <span className="text-xs text-text-muted">{stats.entries.length} districts</span>
        </div>
        <div className="divide-y divide-forest-light/10">
          {displayed.map((entry, i) => {
            const rank = i + 1;
            const s = view === 'environmental' ? (entry.envScore ?? 0) : entry.score;
            const scoreColor = s >= 80 ? 'text-leaf' : s >= 60 ? 'text-lime-400' : s >= 40 ? 'text-amber-400' : 'text-rose-400';
            return (
              <button
                key={entry.name}
                onClick={() => handleClick(entry.name)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-forest-light/10 transition-colors text-left"
              >
                <span className="w-6 text-xs text-text-muted text-right font-mono">{rank}</span>
                <span className="flex-1 text-sm text-text-primary truncate">{entry.name}</span>
                <span className={`text-sm font-semibold tabular-nums ${scoreColor}`}>{s}</span>
              </button>
            );
          })}
        </div>
        {stats.entries.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-2 text-xs text-teal hover:bg-forest-light/10 transition-colors"
          >
            {showAll ? 'Show top 10' : `Show all ${stats.entries.length} districts`}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-xl bg-forest/50 border border-forest-light/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-text-primary break-words leading-snug">{value}</div>
      {sub != null && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  );
}
