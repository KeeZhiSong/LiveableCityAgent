import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

const typeLabels = {
  base: 'Starting score',
  hawker: 'Hawker centre',
  park: 'Park',
  supermarket: 'Supermarket',
  childcare: 'Childcare',
  cycling: 'Cycling path',
  gym: 'Gym',
  dengue: 'Health risk',
};

const WalkabilityBreakdown = ({ score, breakdown = [] }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-leaf';
    if (score >= 60) return 'text-lime-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-forest/50 border border-forest-light/50 rounded-lg overflow-hidden">
      {/* Main score display */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">Walkability Score</span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="p-1 hover:bg-forest-light rounded transition-colors"
              title="Show breakdown"
            >
              <Info size={14} className="text-text-muted" />
            </button>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-mono font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className={`text-xs ml-1 ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        <div className="h-2 bg-forest-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal to-leaf rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Expandable breakdown */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full px-4 py-2 flex items-center justify-between bg-forest/30 hover:bg-forest/50 transition-colors border-t border-forest-light/30"
      >
        <span className="text-xs text-text-secondary">
          {showBreakdown ? 'Hide breakdown' : 'Show score breakdown'}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showBreakdown && (
        <div className="px-4 pb-4 space-y-1 border-t border-forest-light/30">
          <div className="pt-3 pb-1 text-xs text-text-muted uppercase tracking-wider">
            Score Breakdown
          </div>
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">
                  {item.type === 'base' ? item.label : (typeLabels[item.type] || item.type)}
                </span>
                {item.distance && (
                  <span className="text-text-muted text-xs">
                    ({item.distance}m)
                  </span>
                )}
              </div>
              <span
                className={`font-mono font-medium ${
                  item.points > 0 ? 'text-leaf' : item.points < 0 ? 'text-rose-400' : 'text-text-muted'
                }`}
              >
                {item.points > 0 ? '+' : ''}{item.points}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-forest-light/30 text-sm font-medium">
            <span className="text-text-primary">Total</span>
            <span className={`font-mono ${getScoreColor(score)}`}>{score}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkabilityBreakdown;
