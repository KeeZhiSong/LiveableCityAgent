import { useState } from 'react';
import { Lightbulb, ChevronRight, ChevronDown, Target, AlertCircle, TrendingUp, X, Sparkles } from 'lucide-react';

const priorityStyles = {
  high: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: 'text-red-400',
  },
  medium: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: 'text-amber-400',
  },
  low: {
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: 'text-blue-400',
  },
};

const typeIcons = {
  focus: Target,
  imbalance: AlertCircle,
  improvement: TrendingUp,
  default: Lightbulb,
};

function RecommendationCard({ recommendation, onAction, isExpanded, onToggle }) {
  const style = priorityStyles[recommendation.priority] || priorityStyles.medium;
  const Icon = typeIcons[recommendation.type] || typeIcons.default;

  return (
    <div className="bg-forest/50 border border-forest-light/30 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-leaf/5 transition-colors"
      >
        <Icon className={style.icon} size={18} />
        <div className="flex-1 text-left">
          <h4 className="text-text-primary text-sm font-medium">
            {recommendation.title}
          </h4>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${style.badge}`}>
          {recommendation.priority}
        </span>
        {isExpanded ? (
          <ChevronDown className="text-text-muted" size={16} />
        ) : (
          <ChevronRight className="text-text-muted" size={16} />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-forest-light/30">
          <p className="text-text-secondary text-sm mt-3 mb-4 leading-relaxed">
            {recommendation.message}
          </p>

          {recommendation.action && (
            <button
              onClick={() => onAction?.(recommendation)}
              className="flex items-center gap-2 px-3 py-1.5 bg-leaf/20 hover:bg-leaf/30 text-leaf rounded transition-colors text-sm"
            >
              {recommendation.action}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationsPanel({ recommendations = [], insights = [], onAction, onClose }) {
  const [expandedId, setExpandedId] = useState(recommendations[0]?.id || null);

  if (recommendations.length === 0 && insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-forest-dark/95 backdrop-blur border border-forest-light/50 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-forest-light/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-leaf/20 flex items-center justify-center">
            <Lightbulb className="text-leaf" size={16} />
          </div>
          <div>
            <h3 className="text-text-primary font-medium text-sm">Agent Recommendations</h3>
            <p className="text-text-muted text-xs">Based on my analysis</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Insights section */}
      {insights && insights.length > 0 && (
        <div className="mx-3 mt-3 p-3 bg-teal/10 border border-teal/20 rounded-lg">
          <h4 className="text-teal text-xs font-semibold uppercase mb-2 flex items-center gap-1">
            <Sparkles size={12} />
            Current Insights
          </h4>
          <ul className="space-y-1.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-text-secondary text-xs flex items-start gap-2">
                <span className="text-teal mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations list */}
      <div className="p-3 space-y-2 max-h-80 overflow-auto">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onAction={onAction}
            isExpanded={expandedId === rec.id}
            onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-forest-light/30 bg-forest/30">
        <p className="text-text-muted text-xs text-center">
          Recommendations update as I monitor district data
        </p>
      </div>
    </div>
  );
}

export default RecommendationsPanel;
