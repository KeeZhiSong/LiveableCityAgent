import { Shield, BarChart3, Lightbulb, Image, Scale, Check, Loader2, Circle } from 'lucide-react';

const AGENTS = [
  { id: 'monitor', name: 'Monitor Agent', icon: Shield, color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30' },
  { id: 'analyst', name: 'Analyst Agent', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'recommender', name: 'Recommender Agent', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'critic', name: 'Critic Agent', icon: Scale, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'vision', name: 'Vision Agent', icon: Image, color: 'text-leaf', bg: 'bg-leaf/10', border: 'border-leaf/30' },
];

function StepIcon({ status, color }) {
  if (status === 'done') return <Check className="w-3 h-3 text-leaf" />;
  if (status === 'active') return <Loader2 className={`w-3 h-3 ${color} animate-spin`} />;
  return <Circle className="w-3 h-3 text-text-muted/40" />;
}

const AgentPipeline = ({ steps = [] }) => {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl bg-forest/60 border border-forest-light/40 p-3">
      <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
        Agent Pipeline
      </h4>
      <div className="space-y-0">
        {AGENTS.map((agent, i) => {
          const step = steps.find(s => s.agent === agent.id);
          if (!step) return null;

          const Icon = agent.icon;
          const isLast = i === AGENTS.length - 1 || !steps.find(s => AGENTS.findIndex(a => a.id === s.agent) > i);

          return (
            <div key={agent.id} className="flex items-stretch gap-2">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center w-5 shrink-0">
                <div className={`w-5 h-5 rounded-full ${agent.bg} ${agent.border} border flex items-center justify-center`}>
                  <StepIcon status={step.status} color={agent.color} />
                </div>
                {!isLast && (
                  <div className={`w-px flex-1 min-h-[12px] ${step.status === 'done' ? 'bg-forest-light' : 'bg-forest-light/30'}`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-2 flex-1 min-w-0 ${step.status === 'idle' ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${agent.color}`} />
                  <span className={`text-xs font-medium ${step.status === 'active' ? agent.color : 'text-text-secondary'}`}>
                    {agent.name}
                  </span>
                </div>
                {step.message && (
                  <p className="text-[11px] text-text-muted mt-0.5 pl-[18px]">{step.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentPipeline;
