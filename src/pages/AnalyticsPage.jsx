import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useAgentContext } from '../contexts/AgentContext';
import DonutChart from '../components/Analytics/DonutChart';
import MetricBars from '../components/Analytics/MetricBars';
import DistrictHeatmap from '../components/Analytics/DistrictHeatmap';

const LIVEABILITY_METRICS = [
  { key: 'airQuality', label: 'Air Quality', weight: 0.20 },
  { key: 'transport', label: 'Transport', weight: 0.25 },
  { key: 'greenSpace', label: 'Green Space', weight: 0.20 },
  { key: 'amenities', label: 'Amenities', weight: 0.20 },
  { key: 'safety', label: 'Safety', weight: 0.15 },
];

const ENV_METRICS = [
  { key: 'envAirQuality', label: 'Air Quality', weight: 0.35 },
  { key: 'envGreenCoverage', label: 'Green Coverage', weight: 0.30 },
  { key: 'envVectorSafety', label: 'Vector Safety', weight: 0.20 },
  { key: 'envClimate', label: 'Climate', weight: 0.15 },
];

export default function AnalyticsPage() {
  const { districtScores, isLoadingScores } = useAgentContext();
  const [dimension, setDimension] = useState('liveability');

  const METRICS = dimension === 'environmental' ? ENV_METRICS : LIVEABILITY_METRICS;
  const scoreKey = dimension === 'environmental' ? 'envScore' : 'overall';

  const { entries, metricData, deficits, cityAvg, best, worst, belowCount } = useMemo(() => {
    const entries = Object.entries(districtScores || {})
      .filter(([, v]) => v?.overall != null)
      .map(([name, data]) => ({
        name,
        overall: data.overall || 0,
        airQuality: data.airQuality || 0,
        transport: data.transport || 0,
        greenSpace: data.greenSpace || 0,
        amenities: data.amenities || 0,
        safety: data.safety || 0,
        envScore: data.envScore || 0,
        envAirQuality: data.envAirQuality || 0,
        envGreenCoverage: data.envGreenCoverage || 0,
        envVectorSafety: data.envVectorSafety || 0,
        envClimate: data.envClimate || 0,
      }));

    if (entries.length === 0) {
      return { entries: [], metricData: [], deficits: [], cityAvg: 0, best: null, worst: null, belowCount: 0 };
    }

    const metricData = METRICS.map((m) => {
      const scores = entries.map((e) => e[m.key]);
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      return { ...m, avg };
    });

    const deficits = metricData.map((m) => ({
      ...m,
      deficit: (100 - m.avg) * m.weight,
    }));

    const overalls = entries.map((e) => e[scoreKey]);
    const cityAvg = Math.round(overalls.reduce((s, v) => s + v, 0) / overalls.length);

    const sorted = [...metricData].sort((a, b) => b.avg - a.avg);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const belowCount = entries.filter((e) => e[scoreKey] < 50).length;

    return { entries, metricData, deficits, cityAvg, best, worst, belowCount };
  }, [districtScores, METRICS, scoreKey]);

  if (isLoadingScores || entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-forest-light/20" />
          <div className="h-4 w-32 mx-auto bg-forest-light/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-teal" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
          <p className="text-xs text-text-muted">City-wide {dimension === 'environmental' ? 'environmental' : 'liveability'} breakdown across {entries.length} districts</p>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-forest/50 border border-forest-light/20">
          <button
            onClick={() => setDimension('liveability')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              dimension === 'liveability' ? 'bg-forest-light/30 text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >Liveability</button>
          <button
            onClick={() => setDimension('environmental')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              dimension === 'environmental' ? 'bg-teal/20 text-teal' : 'text-text-muted hover:text-text-secondary'
            }`}
          >Environmental</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="City Average"
          value={cityAvg}
          icon={<BarChart3 className="w-4 h-4 text-teal" />}
        />
        <StatCard
          label="Strongest Metric"
          value={best.label}
          sub={`avg ${Math.round(best.avg)}`}
          icon={<TrendingUp className="w-4 h-4 text-leaf" />}
        />
        <StatCard
          label="Weakest Metric"
          value={worst.label}
          sub={`avg ${Math.round(worst.avg)}`}
          icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
        />
        <StatCard
          label="Below 50"
          value={belowCount}
          sub={`of ${entries.length} districts`}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="rounded-xl bg-forest/50 border border-forest-light/30 p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Score Deficit Breakdown</h3>
          <p className="text-xs text-text-muted mb-4">
            What's contributing most to Singapore falling short of a perfect 100.
          </p>
          <DonutChart deficits={deficits} centerValue={cityAvg} />
        </div>

        {/* Metric bars */}
        <div className="rounded-xl bg-forest/50 border border-forest-light/30 p-5">
          <MetricBars metrics={metricData} />
        </div>
      </div>

      {/* Heatmap */}
      <DistrictHeatmap districts={dimension === 'environmental' ? entries.map(e => ({ ...e, overall: e.envScore })) : entries} />
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
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
