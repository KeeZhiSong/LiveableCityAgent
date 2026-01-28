import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Leaf, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NotificationDrawer, AgentSpeechBubble } from '../Agent';
import { AgentStatusIndicator } from '../Agent/AgentStatusIndicator';
import { useAgentContext } from '../../contexts/AgentContext';
import { useAgentNarrator } from '../../hooks/useAgentNarrator';
import GuidedTour from '../Tour/GuidedTour';

export function AppLayout() {
  const {
    notifications,
    agentMessage,
    agentSpeak,
    alerts,
    districtScores,
    dismissNotification,
    clearNotifications,
    clearAgentMessage,
  } = useAgentContext();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Drives page-aware tips, alert narration, idle insights
  useAgentNarrator({ agentSpeak, agentMessage, alerts, districtScores });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-forest-dark border-b border-forest-light/30 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Leaf className="w-5 h-5 text-leaf animate-pulse-slow" />
            <div className="absolute inset-0 blur-md bg-leaf/30 rounded-full" />
          </div>
          <h1 className="text-lg font-bold">
            <span className="bg-gradient-to-r from-leaf to-teal bg-clip-text text-transparent">
              LiveableCity
            </span>
            <span className="text-text-secondary font-medium ml-1 text-sm">Agent</span>
          </h1>
        </div>

        {/* Right side: Agent Status + Notifications */}
        <div className="flex items-center gap-4">
          <AgentStatusIndicator />
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative text-text-muted hover:text-text-primary transition-colors"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-leaf text-forest-dark text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Overlays */}
      <NotificationDrawer
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearNotifications}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Speech bubble — always rendered, handles its own collapsed/expanded state */}
      <AgentSpeechBubble
        message={agentMessage?.message}
        type={agentMessage?.type}
        onDismiss={clearAgentMessage}
      />

      {/* First-time guided tour */}
      <GuidedTour />
    </div>
  );
}

export default AppLayout;
