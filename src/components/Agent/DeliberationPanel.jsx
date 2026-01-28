import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Shield, Lightbulb, Scale } from 'lucide-react';

const AGENT_META = {
  recommender: { label: 'Recommender', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critic: { label: 'Critic', icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const DeliberationPanel = ({ deliberation = [] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!deliberation || deliberation.length === 0) return null;

  const critic = deliberation.find((d) => d.agent === 'critic');
  const agreementLabel = critic?.agreement === 'agree' ? 'Consensus reached'
    : critic?.agreement === 'partial' ? 'Partial agreement'
    : 'Agents disagreed';
  const agreementColor = critic?.agreement === 'agree' ? 'text-leaf'
    : critic?.agreement === 'partial' ? 'text-amber-400'
    : 'text-rose-400';

  return (
    <div className="rounded-xl bg-forest/60 border border-forest-light/40 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-forest-light/10 transition-colors text-left"
      >
        <Scale className="w-4 h-4 text-violet-400 shrink-0" />
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Agent Deliberation
        </span>
        <span className={`ml-1 text-[10px] font-medium ${agreementColor}`}>
          — {agreementLabel}
        </span>
        <span className="ml-auto">
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
            : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          }
        </span>
      </button>

      {/* Expanded chat thread */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {deliberation.map((entry, i) => {
            const meta = AGENT_META[entry.agent];
            if (!meta) return null;
            const Icon = meta.icon;

            return (
              <div key={i} className={`flex gap-2 ${entry.agent === 'critic' ? 'pl-4' : ''}`}>
                <div className={`w-6 h-6 rounded-full ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[11px] font-medium ${meta.color}`}>{meta.label}</span>
                    {entry.agreement && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        entry.agreement === 'agree' ? 'bg-leaf/10 text-leaf' :
                        entry.agreement === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {entry.agreement}
                      </span>
                    )}
                    {entry.adjustments && entry.adjustments !== 'none' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal/10 text-teal">
                        adjusted
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{entry.text}</p>
                  {entry.alternativeFocus && entry.alternativeFocus !== 'null' && (
                    <p className="text-[10px] text-text-muted mt-1 italic">
                      Alternative focus: {entry.alternativeFocus}
                    </p>
                  )}
                  {entry.adjustments && entry.adjustments !== 'none' && (
                    <p className="text-[10px] text-text-muted mt-1 italic">
                      Adjustments: {entry.adjustments}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliberationPanel;
