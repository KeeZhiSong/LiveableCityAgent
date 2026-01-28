import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendIndicator = ({ trend, size = 'sm', showLabel = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const config = {
    up: {
      icon: TrendingUp,
      color: 'text-leaf',
      bg: 'bg-leaf/20',
      label: 'Improving'
    },
    down: {
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'bg-rose-500/20',
      label: 'Declining'
    },
    stable: {
      icon: Minus,
      color: 'text-gray-400',
      bg: 'bg-gray-500/20',
      label: 'Stable'
    }
  };

  const { icon: Icon, color, bg, label } = config[trend] || config.stable;

  return (
    <div className={`inline-flex items-center gap-1 ${showLabel ? 'px-2 py-1 rounded-full ' + bg : ''}`}>
      <Icon className={`${sizes[size]} ${color}`} />
      {showLabel && (
        <span className={`text-xs font-medium ${color}`}>{label}</span>
      )}
    </div>
  );
};

export default TrendIndicator;
