import { useAgentAlerts } from '../../hooks/useAgentAlerts';
import { useAgentStatus } from '../../hooks/useAgentStatus';

export function ActivityFeed() {
  const { alerts } = useAgentAlerts();
  const { isOnline, lastRun, runCount } = useAgentStatus();

  // Create feed items from alerts and status
  const feedItems = [
    // Add status updates
    ...(isOnline ? [{
      id: 'status-online',
      type: 'status',
      message: `Agent monitoring ${runCount} districts`,
      timestamp: new Date().toISOString(),
    }] : []),
    // Add recent alerts
    ...alerts.slice(0, 5).map(alert => ({
      id: alert.id,
      type: alert.severity === 'critical' ? 'warning' : 'info',
      message: `${alert.district || 'System'}: ${alert.title || alert.message}`,
      timestamp: alert.timestamp,
    })),
  ];

  // If no items, show default message
  if (feedItems.length === 0) {
    feedItems.push({
      id: 'default',
      type: 'info',
      message: 'LiveableCity Agent initialized. Monitoring Singapore districts...',
      timestamp: new Date().toISOString(),
    });
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'status': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '🔴';
      case 'success':
        return '✅';
      case 'status':
        return '🤖';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 overflow-hidden">
      <div className="flex items-center h-8 px-4">
        {/* Agent indicator */}
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 font-medium">AGENT</span>
        </div>

        {/* Scrolling feed */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap">
            {feedItems.map((item, index) => (
              <span key={`feed-${index}`} className="inline-flex items-center mx-8">
                <span className="mr-2">{getTypeIcon(item.type)}</span>
                <span className={`text-xs ${getTypeColor(item.type)}`}>
                  {item.message}
                </span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {feedItems.map((item, index) => (
              <span key={`feed-dup-${index}`} className="inline-flex items-center mx-8">
                <span className="mr-2">{getTypeIcon(item.type)}</span>
                <span className={`text-xs ${getTypeColor(item.type)}`}>
                  {item.message}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Last run indicator */}
        {lastRun && (
          <div className="flex-shrink-0 ml-4 text-xs text-gray-600">
            Last check: {new Date(lastRun).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
