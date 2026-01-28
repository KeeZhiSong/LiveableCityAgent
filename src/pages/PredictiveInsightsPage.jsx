import { useMemo } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, Info, AlertCircle, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { usePredictiveInsights } from '../hooks/usePredictiveInsights';
import { useState } from 'react';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertCircle },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Info },
};

const CATEGORY_COLORS = {
  greenery: 'bg-leaf/20 text-leaf',
  transport: 'bg-blue-500/20 text-blue-400',
  safety: 'bg-red-500/20 text-red-400',
  infrastructure: 'bg-amber-500/20 text-amber-400',
};

function InsightCard({ insight }) {
  const severity = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.info;
  const SeverityIcon = severity.icon;
  const categoryClass = CATEGORY_COLORS[insight.category] || 'bg-forest-light/30 text-text-secondary';

  return (
    <div className={`rounded-xl ${severity.bg} border ${severity.border} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SeverityIcon className={`w-4 h-4 shrink-0 ${severity.color}`} />
          <h4 className="text-sm font-medium text-text-primary truncate">{insight.title}</h4>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${categoryClass}`}>
          {insight.category}
        </span>
      </div>

      <p className="text-sm text-text-secondary">{insight.description}</p>

      {insight.predicted_impact && (
        <p className="text-xs text-text-muted italic">{insight.predicted_impact}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        {/* Confidence bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">Confidence</span>
          <div className="w-20 h-1.5 bg-forest-light/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full"
              style={{ width: `${(insight.confidence || 0) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted">{Math.round((insight.confidence || 0) * 100)}%</span>
        </div>

        <span className="text-[10px] text-text-muted">
          {new Date(insight.created_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function DistrictGroup({ district, insights }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left px-1 py-2 hover:bg-forest-light/10 rounded-lg transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        <span className="text-sm font-semibold text-text-primary">{district}</span>
        <span className="text-xs text-text-muted">({insights.length})</span>
      </button>
      {expanded && (
        <div className="space-y-3 pl-6 pb-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PredictiveInsightsPage() {
  const { insights, isLoading, lastUpdated, error, refresh } = usePredictiveInsights();
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => {
    const map = {};
    for (const insight of insights) {
      const d = insight.district || 'Unknown';
      if (!map[d]) map[d] = [];
      map[d].push(insight);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [insights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Predictive Insights</h1>
            <p className="text-xs text-text-muted">
              AI-powered predictions for urban liveability
              {lastUpdated && (
                <> &middot; Updated {new Date(lastUpdated).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forest/80 border border-forest-light/50 hover:border-teal/40 text-sm text-text-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-forest-light/10 border border-forest-light/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-forest-light/30" />
                <div className="h-4 w-48 bg-forest-light/20 rounded" />
              </div>
              <div className="h-3 w-full bg-forest-light/15 rounded" />
              <div className="h-3 w-3/4 bg-forest-light/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && insights.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest-light/20 border border-forest-light/30 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-secondary mb-1">No predictions yet</h3>
          <p className="text-sm text-text-muted max-w-sm">
            Predictive insights will appear here once the n8n workflow processes data and stores results in Supabase.
          </p>
        </div>
      )}

      {/* Grouped insights */}
      {!isLoading && grouped.length > 0 && (
        <div className="space-y-2">
          {grouped.map(([district, districtInsights]) => (
            <DistrictGroup key={district} district={district} insights={districtInsights} />
          ))}
        </div>
      )}
    </div>
  );
}
