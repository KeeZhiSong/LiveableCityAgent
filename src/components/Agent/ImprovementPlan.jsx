import { Train, TreePine, Wind, Building, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import { getImpactColor, getCategoryColor } from '../../utils/colorUtils';

const categoryIcons = {
  transport: Train,
  greenSpace: TreePine,
  airQuality: Wind,
  amenities: Building,
  safety: ShieldCheck
};

const ImprovementCard = ({ improvement }) => {
  const { title, description, category, impact, estimatedScoreChange } = improvement;
  const Icon = categoryIcons[category] || Sparkles;
  const impactColor = getImpactColor(impact);
  const categoryColor = getCategoryColor(category);

  const impactLabels = {
    high: 'High Impact',
    medium: 'Medium Impact',
    low: 'Quick Win'
  };

  return (
    <div className="card-glass-hover p-4">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
            <Badge
              variant={impact === 'high' ? 'success' : impact === 'medium' ? 'warning' : 'default'}
              size="sm"
            >
              {impactLabels[impact] || impact}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mb-2">{description}</p>
          {estimatedScoreChange && (
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3 h-3 text-leaf" />
              <span className="text-leaf">
                +{estimatedScoreChange.overall || 0} overall
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ImprovementPlan = ({
  improvements = [],
  summary,
  simulationResult = null,
  onSimulate,
  isLoading = false
}) => {
  if (improvements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Recommended Improvements
        </h3>
      </div>

      <div className="space-y-2">
        {improvements.map((improvement) => (
          <ImprovementCard key={improvement.id} improvement={improvement} />
        ))}
      </div>

      {summary && (
        <Card className="p-3 bg-forest-light/50 border-forest-light/30">
          <p className="text-sm text-text-secondary italic">{summary}</p>
        </Card>
      )}

      {/* Vision image result */}
      {simulationResult && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-leaf" />
            Impact Vision
          </h3>
          {simulationResult.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-forest-light/30">
              <img
                src={simulationResult.imageUrl}
                alt={`Vision of ${simulationResult.district} after improvements`}
                className="w-full h-auto"
              />
            </div>
          )}
          {simulationResult.analysis && (
            <Card className="p-3 bg-leaf/5 border-leaf/20">
              <p className="text-sm text-text-secondary">{simulationResult.analysis}</p>
            </Card>
          )}
        </div>
      )}

      {/* Generate vision button */}
      {!simulationResult && (
        <Button
          onClick={onSimulate}
          loading={isLoading}
          className="w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Generating Vision...' : 'Visualise Impact'}
        </Button>
      )}
    </div>
  );
};

export default ImprovementPlan;
