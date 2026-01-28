import { Wind, Train, TreePine, Building, ShieldCheck, Leaf, Bug, CloudRain } from 'lucide-react';
import { getScoreColor } from '../../utils/scoreUtils';
import { ProgressBar } from '../ui';
import TrendIndicator from './TrendIndicator';

const iconMap = {
  airQuality: Wind,
  transport: Train,
  greenSpace: TreePine,
  amenities: Building,
  safety: ShieldCheck,
  greenCoverage: Leaf,
  vectorSafety: Bug,
  climate: CloudRain
};

const labelMap = {
  airQuality: 'Air Quality',
  transport: 'Transport',
  greenSpace: 'Green Space',
  amenities: 'Amenities',
  safety: 'Safety',
  greenCoverage: 'Green Coverage',
  vectorSafety: 'Vector Safety',
  climate: 'Climate'
};

const MetricCard = ({
  metricKey,
  score,
  trend = 'stable',
  details,
  onClick,
  className = ''
}) => {
  const Icon = iconMap[metricKey] || Wind;
  const label = labelMap[metricKey] || metricKey;
  const scoreColor = getScoreColor(score);

  return (
    <div
      className={`card-glass-hover p-4 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${scoreColor}20` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: scoreColor }}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-secondary">{label}</h4>
            {details && (
              <p className="text-xs text-text-muted mt-0.5 max-w-[200px] truncate">
                {details}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-mono font-bold"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
          <TrendIndicator trend={trend} />
        </div>
      </div>
      <ProgressBar value={score} size="sm" color={scoreColor} />
    </div>
  );
};

export default MetricCard;
