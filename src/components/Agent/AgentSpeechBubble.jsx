import { useState, useEffect, useRef } from 'react';
import { Bot, X, Sparkles, AlertTriangle, Lightbulb, MessageCircle, ChevronUp } from 'lucide-react';

const typeConfig = {
  greeting: {
    icon: Sparkles,
    color: 'text-leaf',
    bg: 'bg-leaf/10',
    border: 'border-leaf/30',
    pill: 'bg-leaf/20 text-leaf',
  },
  recommendation: {
    icon: Lightbulb,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    pill: 'bg-amber-500/20 text-amber-400',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    pill: 'bg-red-500/20 text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    pill: 'bg-amber-500/20 text-amber-400',
  },
  info: {
    icon: MessageCircle,
    color: 'text-teal',
    bg: 'bg-teal/10',
    border: 'border-teal/30',
    pill: 'bg-teal/20 text-teal',
  },
};

// Thinking dots component shown before text starts typing
function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center h-4">
      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

export function AgentSpeechBubble({ message, type = 'info', onDismiss, lastMessage }) {
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | thinking | typing | done
  const [expanded, setExpanded] = useState(true);
  const [lastShown, setLastShown] = useState(null); // last message shown (persists after dismiss)
  const prevMessageRef = useRef(null);

  const activeMessage = message || lastShown;
  const activeType = message ? type : (lastShown?.type || 'info');
  const config = typeConfig[activeType] || typeConfig.info;
  const Icon = config.icon;

  // When a new message arrives, run: thinking → typing → done
  useEffect(() => {
    if (!message) return;
    if (message === prevMessageRef.current) return;
    prevMessageRef.current = message;

    setExpanded(true);
    setDisplayedText('');
    setPhase('thinking');

    // Show thinking dots for 600ms, then start typing
    const thinkTimeout = setTimeout(() => {
      setPhase('typing');
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < message.length) {
          setDisplayedText(message.slice(0, index + 1));
          index++;
        } else {
          setPhase('done');
          clearInterval(typeInterval);
        }
      }, 25);

      // Save for persistence
      setLastShown({ text: message, type });

      return () => clearInterval(typeInterval);
    }, 600);

    return () => clearTimeout(thinkTimeout);
  }, [message, type]);

  // When message is dismissed, collapse but keep lastShown
  const handleDismiss = () => {
    setExpanded(false);
    if (onDismiss) onDismiss();
  };

  // Nothing to show at all
  if (!activeMessage && !lastShown) return null;

  const bubbleText = message ? displayedText : (lastShown?.text || '');
  const isActive = !!message;

  return (
    <div className="fixed bottom-4 left-4 z-[1500]">
      {/* Collapsed pill — always visible, shows last message preview */}
      {!expanded && lastShown && (
        <button
          onClick={() => setExpanded(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bg} ${config.border} border shadow-lg backdrop-blur-sm hover:scale-105 transition-transform`}
        >
          <Bot className={config.color} size={16} />
          <span className="text-text-secondary text-xs max-w-[200px] truncate">
            {lastShown.text}
          </span>
          <ChevronUp size={12} className="text-text-muted" />
        </button>
      )}

      {/* Expanded speech bubble */}
      {expanded && (activeMessage || lastShown) && (
        <div className="max-w-md animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-end gap-2">
            {/* Agent avatar with pulse when active */}
            <div className={`relative w-10 h-10 rounded-full ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0`}>
              <Bot className={config.color} size={20} />
              {isActive && phase !== 'done' && (
                <span className={`absolute inset-0 rounded-full ${config.bg} animate-ping opacity-50`} />
              )}
            </div>

            {/* Speech bubble */}
            <div className={`${config.bg} ${config.border} border rounded-2xl rounded-bl-md p-4 shadow-xl backdrop-blur-sm`}>
              <div className="flex items-start gap-2">
                <Icon className={`${config.color} flex-shrink-0 mt-0.5`} size={16} />
                <div className="flex-1 min-w-0">
                  {phase === 'thinking' && isActive ? (
                    <ThinkingDots />
                  ) : (
                    <p className="text-text-primary text-sm leading-relaxed">
                      {bubbleText}
                      {phase === 'typing' && isActive && <span className="animate-pulse ml-0.5">|</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Agent label */}
              <div className="mt-2 pt-2 border-t border-forest-light/30 flex items-center gap-1">
                <span className="text-xs text-text-muted">LiveableCity Agent</span>
                {isActive && phase !== 'done' && (
                  <span className="flex gap-0.5 ml-1">
                    <span className="w-1 h-1 bg-leaf rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-leaf rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-leaf rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentSpeechBubble;
