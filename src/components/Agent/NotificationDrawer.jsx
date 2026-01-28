import { useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, TrendingDown, MapPin, Lightbulb, ChevronRight } from 'lucide-react';

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

function NotificationItem({ notification, onDismiss, onAction }) {
  const style = severityStyles[notification.severity] || severityStyles.medium;
  const Icon = typeIcons[notification.type] || typeIcons.default;

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-3`}>
      <div className="flex items-start gap-3">
        <div className={`${style.icon} mt-0.5 flex-shrink-0`}>
          <Icon size={18} />
        </div>

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
            <p className="text-text-secondary text-xs line-clamp-2">
              {notification.message}
            </p>
          )}

          {notification.district && (
            <button
              onClick={() => onAction?.(notification)}
              className="mt-2 text-xs text-leaf hover:text-lime transition-colors flex items-center gap-1"
            >
              View {notification.district}
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss?.(notification.id)}
          className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function NotificationDrawer({ notifications, onDismiss, onAction, onClearAll, isOpen, onClose }) {
  const drawerRef = useRef(null);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={drawerRef} className="fixed top-12 right-4 z-[2000] w-80 max-h-[60vh] bg-forest/95 backdrop-blur-md border border-forest-light/50 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-forest-light/30">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-leaf" />
          <span className="text-text-primary font-medium text-sm">Notifications</span>
          {notifications.length > 0 && (
            <span className="bg-leaf/20 text-leaf text-xs font-medium px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && onClearAll && (
            <button
              onClick={() => {
                onClearAll();
                onClose?.();
              }}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[calc(60vh-48px)] p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-text-muted">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-1">All districts within normal parameters</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              onAction={(n) => {
                onAction?.(n);
                onClose?.();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationDrawer;
