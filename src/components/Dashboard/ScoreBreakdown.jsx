import { useState } from 'react';
import MetricCard from './MetricCard';

const LIVEABILITY_METRICS = ['airQuality', 'transport', 'greenSpace', 'amenities', 'safety'];
const ENV_METRICS = ['airQuality', 'greenCoverage', 'vectorSafety', 'climate'];

const ScoreBreakdown = ({ breakdown = {}, envBreakdown, onMetricClick }) => {
  const [tab, setTab] = useState('liveability');

  const hasEnv = envBreakdown && Object.keys(envBreakdown).length > 0;
  const metrics = tab === 'environmental' && hasEnv ? ENV_METRICS : LIVEABILITY_METRICS;
  const activeBreakdown = tab === 'environmental' && hasEnv ? envBreakdown : breakdown;

  return (
    <div className="space-y-3">
      {/* Tab toggle */}
      {hasEnv ? (
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-forest/50 border border-forest-light/20">
          <button
            onClick={() => setTab('liveability')}
            className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              tab === 'liveability'
                ? 'bg-forest-light/30 text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Liveability
          </button>
          <button
            onClick={() => setTab('environmental')}
            className={`flex-1 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              tab === 'environmental'
                ? 'bg-teal/20 text-teal'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Environmental
          </button>
        </div>
      ) : (
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Score Breakdown
        </h3>
      )}

      <div className="space-y-2">
        {metrics.map((metric) => {
          const data = activeBreakdown[metric] || { score: 0, trend: 'stable', details: '' };
          return (
            <MetricCard
              key={metric}
              metricKey={metric}
              score={data.score}
              trend={data.trend}
              details={data.details}
              onClick={() => onMetricClick?.(metric)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
