import { CheckCircle, AlertTriangle } from 'lucide-react';

const StreetAIInsights = ({ insights }) => {
  if (!insights) return null;

  return (
    <div className="space-y-3">
      {/* Main Observation */}
      <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-4">
        <p className="text-text-primary text-sm leading-relaxed">
          {insights.observation}
        </p>
      </div>

      {/* Strengths */}
      {insights.strengths && insights.strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={12} className="text-leaf" /> Strengths
          </p>
          {insights.strengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-leaf mt-0.5">✓</span>
              <span>{strength}</span>
            </div>
          ))}
        </div>
      )}

      {/* Concerns */}
      {insights.concerns && insights.concerns.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={12} className="text-amber-400" /> Areas for Improvement
          </p>
          {insights.concerns.map((concern, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-amber-400 mt-0.5">!</span>
              <span>{concern}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreetAIInsights;
