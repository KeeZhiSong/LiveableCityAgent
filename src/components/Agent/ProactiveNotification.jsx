import { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingDown, MapPin, Lightbulb } from 'lucide-react';

const severityStyles = {
  critical: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: 'text-red-400',
    badge: 'bg-red-500',
  },
  high: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    icon: 'text-amber-400',
    badge: 'bg-amber-500',
  },
  medium: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500',
  },
  low: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
    badge: 'bg-blue-500',
  },
};

const typeIcons = {
  score_drop: TrendingDown,
  critical_score: AlertTriangle,
  low_score: AlertTriangle,
  recommendation: Lightbulb,
  default: MapPin,
};

export function ProactiveNotification({ notification, onDismiss, onAction }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const style = severityStyles[notification.severity] || severityStyles.medium;
  const Icon = typeIcons[notification.type] || typeIcons.default;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss after 10 seconds for non-critical
    if (notification.severity !== 'critical') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notification.severity]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.(notification.id);
    }, 300);
  };

  const handleAction = () => {
    onAction?.(notification);
    handleDismiss();
  };

  return (
    <div
      className={`
        ${style.bg} ${style.border} border rounded-lg p-4 shadow-xl backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${style.icon} mt-0.5`}>
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${style.badge} text-white text-xs font-bold px-1.5 py-0.5 rounded uppercase`}>
              {notification.severity}
            </span>
            {notification.district && (
              <span className="text-text-secondary text-xs">{notification.district}</span>
            )}
          </div>

          <h4 className="text-text-primary font-medium text-sm mb-1">
            {notification.title}
          </h4>

          {notification.message && (
            <p className="text-text-secondary text-xs">
              {notification.message}
            </p>
          )}

          {/* Action button */}
          {notification.district && (
            <button
              onClick={handleAction}
              className="mt-2 text-xs text-leaf hover:text-lime transition-colors"
            >
              View {notification.district} →
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function NotificationStack({ notifications, onDismiss, onAction }) {
  return (
    <div className="fixed bottom-20 left-4 z-[2000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(0, 3).map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ProactiveNotification
            notification={notification}
            onDismiss={onDismiss}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}

export default ProactiveNotification;
