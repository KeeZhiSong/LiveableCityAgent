import { Bot, Loader2, CheckCircle } from 'lucide-react';

const AgentStatus = ({ status = 'idle', message = '' }) => {
  const statusConfig = {
    idle: {
      icon: Bot,
      color: 'text-text-muted',
      bg: 'bg-forest-light',
      message: 'Ready to assist'
    },
    analyzing: {
      icon: Loader2,
      color: 'text-teal',
      bg: 'bg-teal/20',
      message: 'Analyzing district data...',
      animate: true
    },
    generating: {
      icon: Loader2,
      color: 'text-leaf',
      bg: 'bg-leaf/20',
      message: 'Generating recommendations...',
      animate: true
    },
    complete: {
      icon: CheckCircle,
      color: 'text-leaf',
      bg: 'bg-leaf/20',
      message: 'Analysis complete'
    }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
      <span className={`text-sm ${config.color}`}>
        {message || config.message}
      </span>
    </div>
  );
};

export default AgentStatus;
