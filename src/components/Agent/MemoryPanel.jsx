import { useState, useEffect } from 'react';
import { Brain, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { agentMemory } from '../../services/agentMemory';

const MemoryPanel = ({ district }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district) return;
    let cancelled = false;
    setLoading(true);
    agentMemory.getForDistrict(district, 5).then((data) => {
      if (!cancelled) {
        setMemories(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [district]);

  if (loading) {
    return (
      <div className="rounded-xl bg-forest/60 border border-forest-light/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Agent Memory</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-3/4 bg-forest-light/20 rounded" />
          <div className="h-3 w-1/2 bg-forest-light/20 rounded" />
        </div>
      </div>
    );
  }

  if (memories.length === 0) return null;

  return (
    <div className="rounded-xl bg-forest/60 border border-forest-light/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-violet-400" />
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Agent Memory</span>
        <span className="ml-auto text-[10px] text-text-muted">{memories.length} entries</span>
      </div>

      <div className="space-y-2">
        {memories.map((m) => (
          <MemoryEntry key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
};

function MemoryEntry({ memory }) {
  const date = new Date(memory.created_at).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short',
  });
  const title = memory.content?.title || memory.content?.description || 'Observation';
  const outcome = memory.outcome;

  let OutcomeIcon = Minus;
  let outcomeColor = 'text-text-muted';
  let outcomeText = 'Pending';

  if (outcome) {
    const delta = outcome.delta ?? (outcome.score_after - outcome.score_before);
    if (delta > 0) {
      OutcomeIcon = TrendingUp;
      outcomeColor = 'text-leaf';
      outcomeText = `+${delta} pts`;
    } else if (delta < 0) {
      OutcomeIcon = TrendingDown;
      outcomeColor = 'text-rose-400';
      outcomeText = `${delta} pts`;
    } else {
      outcomeText = 'No change';
    }
  }

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-forest/40 border border-forest-light/20">
      <div className="flex flex-col items-center shrink-0">
        <Clock className="w-3 h-3 text-text-muted" />
        <span className="text-[9px] text-text-muted mt-0.5">{date}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{title}</p>
        {memory.content?.improvements?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {memory.content.improvements.slice(0, 2).map((imp, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-forest-light/20 text-text-muted truncate max-w-[120px]">
                {imp}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={`flex items-center gap-1 shrink-0 ${outcomeColor}`}>
        <OutcomeIcon className="w-3 h-3" />
        <span className="text-[10px] font-medium">{outcomeText}</span>
      </div>
    </div>
  );
}

export default MemoryPanel;
