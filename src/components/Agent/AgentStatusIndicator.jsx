import { useState } from 'react';
import { useAgentStatus } from '../../hooks/useAgentStatus';

export function AgentStatusIndicator() {
  const { status, lastRun, runCount, alertsActive, isOnline, loading } = useAgentStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const statusColor = {
    online: 'bg-green-500',
    active: 'bg-green-500',
    offline: 'bg-red-500',
    unknown: 'bg-gray-500',
  }[status] || 'bg-gray-500';

  const statusText = {
    online: 'Agent Online',
    active: 'Agent Active',
    offline: 'Agent Offline',
    unknown: 'Connecting...',
  }[status] || 'Unknown';

  const formatLastRun = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="relative flex items-center gap-2 cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Pulse indicator */}
      <div className="relative">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
        {isOnline && (
          <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${statusColor} animate-ping opacity-75`} />
        )}
      </div>

      {/* Status text */}
      <span className="text-sm text-gray-300 hidden sm:inline">
        {loading ? 'Connecting...' : statusText}
      </span>

      {/* Alerts badge */}
      {alertsActive > 0 && (
        <span className="bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
          {alertsActive}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px]">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={isOnline ? 'text-green-400' : 'text-red-400'}>{statusText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Run:</span>
              <span className="text-white">{formatLastRun(lastRun)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Runs:</span>
              <span className="text-white">{runCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Alerts:</span>
              <span className={alertsActive > 0 ? 'text-amber-400' : 'text-white'}>{alertsActive}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentStatusIndicator;
