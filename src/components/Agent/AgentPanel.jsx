import { Bot, Sparkles } from 'lucide-react';
import AgentMessage from './AgentMessage';
import AgentStatus from './AgentStatus';
import ImprovementPlan from './ImprovementPlan';
import AgentPipeline from './AgentPipeline';
import DeliberationPanel from './DeliberationPanel';
import MemoryPanel from './MemoryPanel';
import { Button, Card } from '../ui';

const AgentPanel = ({
  district,
  insights = [],
  status = 'idle',
  statusMessage = '',
  improvements = [],
  improvementSummary = '',
  deliberation = null,
  simulationResult = null,
  pipelineSteps = [],
  onGetPlan,
  onSimulate,
  isLoadingPlan = false,
  isLoadingSimulation = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-teal" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            AI Agent Insights
          </h3>
        </div>
        <AgentStatus status={status} message={statusMessage} />
      </div>

      {/* Agent Pipeline */}
      {pipelineSteps.length > 0 && (
        <AgentPipeline steps={pipelineSteps} />
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-4 space-y-3">
          {insights.map((insight, index) => (
            <AgentMessage
              key={index}
              message={insight}
              type="insight"
              isNew={index === 0}
            />
          ))}
        </Card>
      )}

      {/* Get Improvement Plan Button */}
      {insights.length > 0 && improvements.length === 0 && (
        <Button
          onClick={onGetPlan}
          loading={isLoadingPlan}
          className="w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get Improvement Plan
        </Button>
      )}

      {/* Improvement Plan */}
      {improvements.length > 0 && (
        <ImprovementPlan
          improvements={improvements}
          summary={improvementSummary}
          simulationResult={simulationResult}
          onSimulate={onSimulate}
          isLoading={isLoadingSimulation}
        />
      )}

      {/* Agent Deliberation */}
      {deliberation && deliberation.length > 0 && (
        <DeliberationPanel deliberation={deliberation} />
      )}

      {/* Agent Memory */}
      {district && (
        <MemoryPanel district={district} />
      )}
    </div>
  );
};

export default AgentPanel;
