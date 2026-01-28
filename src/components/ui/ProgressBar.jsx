import { getScoreColor } from '../../utils/scoreUtils';

const ProgressBar = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color,
  className = '',
  animated = true,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || getScoreColor(value);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-text-secondary">{value}</span>
          <span className="text-sm text-text-muted">/{max}</span>
        </div>
      )}
      <div className={`w-full bg-forest-light rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} rounded-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
