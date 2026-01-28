import { useEffect, useState } from 'react';
import { getScoreColor, getScoreLabel } from '../../utils/scoreUtils';

const ScoreRing = ({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className = ''
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  const sizes = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-xl' },
    md: { width: 140, strokeWidth: 8, fontSize: 'text-3xl' },
    lg: { width: 180, strokeWidth: 10, fontSize: 'text-4xl' }
  };

  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;
  const scoreColor = getScoreColor(score);

  useEffect(() => {
    if (animated) {
      const duration = 1000;
      const startTime = Date.now();
      const startScore = displayScore;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = startScore + (score - startScore) * easeOut;

        setDisplayScore(Math.round(currentScore));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="#1a3f2f"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor}40)`
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono font-bold ${fontSize}`}
          style={{ color: scoreColor }}
        >
          {displayScore}
        </span>
        <span className="text-text-muted text-sm">/100</span>
      </div>

      {/* Label below */}
      {showLabel && (
        <span
          className="mt-2 text-sm font-medium"
          style={{ color: scoreColor }}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
