import { Bot, AlertTriangle, Lightbulb, Zap, BarChart3 } from 'lucide-react';
import TypeWriter from './TypeWriter';

const typeConfig = {
  insight: {
    icon: Lightbulb,
    borderColor: 'border-l-teal',
    iconBg: 'bg-teal/20',
    iconColor: 'text-teal'
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400'
  },
  action: {
    icon: Zap,
    borderColor: 'border-l-leaf',
    iconBg: 'bg-leaf/20',
    iconColor: 'text-leaf'
  },
  analysis: {
    icon: BarChart3,
    borderColor: 'border-l-lime',
    iconBg: 'bg-lime/20',
    iconColor: 'text-lime'
  }
};

const AgentMessage = ({
  message,
  type = 'insight',
  timestamp,
  isNew = false,
  className = ''
}) => {
  const config = typeConfig[type] || typeConfig.insight;
  const Icon = config.icon;

  return (
    <div
      className={`border-l-2 ${config.borderColor} pl-4 py-2 animate-fadeIn ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${config.iconBg} shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary/90 leading-relaxed">
            {isNew ? (
              <TypeWriter text={message} speed={20} />
            ) : (
              message
            )}
          </p>
          {timestamp && (
            <span className="text-xs text-text-muted mt-1 block">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentMessage;
