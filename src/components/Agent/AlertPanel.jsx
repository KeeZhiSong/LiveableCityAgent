import { useState } from 'react';
import { useAgentAlerts } from '../../hooks/useAgentAlerts';

export function AlertPanel({ onDistrictClick }) {
  const { alerts, loading, error, lastUpdate, triggerManualCheck } = useAgentAlerts();
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    await triggerManualCheck();
    setTriggering(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-amber-500 bg-amber-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-blue-500',
    };
    return (
      <span className={`${colors[severity] || 'bg-gray-500'} text-white text-xs px-2 py-0.5 rounded uppercase font-semibold`}>
        {severity}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'air_quality':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'transport':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'safety':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'amenities':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-SG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-white font-semibold">Agent Alerts</h3>
          {alerts.length > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="text-sm text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 transition-colors"
        >
          {triggering ? 'Checking...' : 'Run Check'}
        </button>
      </div>

      {/* Alert list */}
      <div className="max-h-[400px] overflow-y-auto">
        {error && (
          <div className="p-4 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {alerts.length === 0 && !error ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No active alerts</p>
            <p className="text-xs mt-1">All districts within normal parameters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 ${getSeverityColor(alert.severity)} cursor-pointer hover:bg-gray-700/30 transition-colors`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</span>
                    </div>
                    <p className="text-white text-sm font-medium">{alert.title || alert.message}</p>
                    {alert.district && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDistrictClick?.(alert.district);
                        }}
                        className="text-cyan-400 text-xs hover:underline mt-1"
                      >
                        {alert.district} →
                      </button>
                    )}

                    {/* Expanded details */}
                    {expandedAlert === alert.id && alert.details && (
                      <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
                        {alert.details}
                        {alert.recommendation && (
                          <div className="mt-2 p-2 bg-gray-700/50 rounded">
                            <span className="text-cyan-400 text-xs font-semibold">Recommendation:</span>
                            <p className="text-gray-300 mt-1">{alert.recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedAlert === alert.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {lastUpdate && (
        <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
          Last updated: {formatTimestamp(lastUpdate)}
        </div>
      )}
    </div>
  );
}

export default AlertPanel;
