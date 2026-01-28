import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { useAgentAlerts } from '../../hooks/useAgentAlerts';
import { useAgentStatus } from '../../hooks/useAgentStatus';

const ActivityFeed = ({ activities = [] }) => {
  const { alerts, countdownFormatted, isTriggering, lastUpdate } = useAgentAlerts();
  const { isOnline, lastRun } = useAgentStatus();

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }

  // Build the feed with real-time status
  const mergedFeed = useMemo(() => {
    const items = [];

    // Add current status message
    if (isTriggering) {
      items.push({
        id: 'status-scanning',
        type: 'analysis',
        message: 'AI Agent scanning Singapore districts for liveability issues...',
        timestamp: 'Now',
      });
    } else if (isOnline) {
      items.push({
        id: 'status-monitoring',
        type: 'insight',
        message: `Agent active - next autonomous scan in ${countdownFormatted}`,
        timestamp: '',
      });
    }

    // Add alerts from n8n
    const agentItems = alerts.slice(0, 5).map(alert => ({
      id: `alert-${alert.id}`,
      type: alert.severity === 'critical' ? 'warning' : alert.severity === 'high' ? 'warning' : 'insight',
      message: `${alert.district || 'System'}: ${alert.title || alert.message || alert.details || 'Alert detected'}`,
      timestamp: alert.timestamp ? formatTimestamp(alert.timestamp) : '',
    }));
    items.push(...agentItems);

    // Add local activities
    items.push(...activities.slice(0, 10).map(a => ({
      ...a,
      timestamp: a.timestamp || '',
    })));

    // If no items, add a default message
    if (items.length === 0) {
      items.push({
        id: 'status-idle',
        type: 'insight',
        message: 'Connecting to LiveableCity monitoring agent...',
        timestamp: '',
      });
    }

    return items.slice(0, 15);
  }, [alerts, activities, isTriggering, isOnline, countdownFormatted]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'analysis': return '🔍';
      case 'action': return '⚡';
      case 'insight': return '💡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="h-12 bg-forest-dark border-t border-forest-light/30 flex items-center">
      {/* Agent status indicator with countdown - fixed width */}
      <div className="flex-shrink-0 flex items-center h-full px-4 border-r border-forest-light/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTriggering ? 'bg-amber-500 animate-pulse' : isOnline ? 'bg-leaf' : 'bg-gray-500'}`} />
          <span className="text-xs text-text-secondary font-medium">AGENT</span>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center h-full px-4 border-r border-forest-light/30">
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-muted">Next:</span>
          <span className={`text-xs font-mono ${isTriggering ? 'text-amber-500' : 'text-leaf'}`}>
            {isTriggering ? 'Scanning...' : countdownFormatted}
          </span>
        </div>
      </div>

      {/* Scrolling content area */}
      <div className="flex-1 h-full relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-forest-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-forest-dark to-transparent z-10 pointer-events-none" />

        {/* Marquee content */}
        <div className="h-full flex items-center overflow-hidden px-4">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {mergedFeed.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 mx-6 text-sm"
              >
                <span>{getTypeIcon(activity.type)}</span>
                <span className="text-text-secondary">
                  {activity.message}
                </span>
                {activity.timestamp && (
                  <span className="text-text-muted">
                    {activity.timestamp}
                  </span>
                )}
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {mergedFeed.map((activity) => (
              <div
                key={`${activity.id}-dup`}
                className="flex items-center gap-2 mx-6 text-sm"
              >
                <span>{getTypeIcon(activity.type)}</span>
                <span className="text-text-secondary">
                  {activity.message}
                </span>
                {activity.timestamp && (
                  <span className="text-text-muted">
                    {activity.timestamp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last update indicator */}
      {lastUpdate && (
        <div className="flex-shrink-0 flex items-center h-full px-4 border-l border-forest-light/30">
          <span className="text-xs text-text-muted">
            Last: {formatTimestamp(lastUpdate)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
