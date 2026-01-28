import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useAgentContext } from '../contexts/AgentContext';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, alertsLoading, acknowledgeAlert, resolveAlert } = useAgentContext();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Alert History</h1>

        <div className="space-y-3">
          {alerts?.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30' :
                alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-forest/50 border-forest-light/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`mt-0.5 shrink-0 ${
                    alert.severity === 'critical' ? 'text-rose-400' :
                    alert.severity === 'high' ? 'text-amber-400' :
                    'text-leaf'
                  }`} size={18} />
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{alert.title}</h3>
                    <p className="text-text-secondary text-xs mt-1">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {alert.district && (
                        <button
                          onClick={() => navigate('/', { state: { selectedDistrict: alert.district } })}
                          className="text-xs text-leaf flex items-center gap-1 hover:underline"
                        >
                          <MapPin size={10} />
                          {alert.district}
                        </button>
                      )}
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    alert.status === 'active' ? 'bg-rose-500/20 text-rose-400' :
                    alert.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-leaf/20 text-leaf'
                  }`}>
                    {alert.status}
                  </span>
                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-forest-light/30 text-text-secondary hover:text-text-primary"
                    >
                      Ack
                    </button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-leaf/10 text-leaf hover:bg-leaf/20"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!alerts || alerts.length === 0) && !alertsLoading && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-leaf mb-3" size={40} />
              <p className="text-text-secondary text-sm">No active alerts</p>
            </div>
          )}

          {alertsLoading && (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">Loading alerts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
