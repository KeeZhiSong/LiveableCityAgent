import { Leaf, Info, HelpCircle, Bell } from 'lucide-react';
import { Button } from '../ui';
import { AgentStatusIndicator } from '../Agent';

const Header = ({ isMonitoring = true }) => {
  return (
    <header className="h-14 bg-forest-dark border-b border-forest-light/30 flex items-center justify-between px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Leaf className="w-7 h-7 text-leaf animate-pulse-slow" />
          <div className="absolute inset-0 blur-md bg-leaf/30 rounded-full" />
        </div>
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-leaf to-teal bg-clip-text text-transparent">
            LiveableCity
          </span>
          <span className="text-text-secondary font-medium ml-1">Agent</span>
        </h1>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center gap-4">
        {/* Agent Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-forest rounded-full border border-forest-light/50">
          <AgentStatusIndicator />
        </div>

        {/* Action Buttons */}
        <Button variant="ghost" size="sm" className="gap-2">
          <Info className="w-4 h-4" />
          About
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
