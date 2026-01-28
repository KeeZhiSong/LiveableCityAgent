import { useState } from 'react';
import { Layers, Eye, EyeOff, Map } from 'lucide-react';

const overlayModes = [
  { id: 'detailed', label: 'Detailed', icon: Layers, description: 'Full color overlay' },
  { id: 'subtle', label: 'Subtle', icon: Eye, description: 'Semi-transparent' },
  { id: 'minimal', label: 'Minimal', icon: Map, description: 'Borders only' },
  { id: 'hidden', label: 'Hidden', icon: EyeOff, description: 'Map only' },
];

const MapControls = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentModeData = overlayModes.find(m => m.id === currentMode) || overlayModes[0];

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-forest/90 backdrop-blur-sm border border-forest-light/50 rounded-lg text-text-primary hover:border-leaf/40 transition-all"
      >
        <currentModeData.icon className="w-4 h-4 text-leaf" />
        <span className="text-sm font-medium">{currentModeData.label}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-forest/95 backdrop-blur-sm border border-forest-light/50 rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-forest-light/30">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Overlay Mode
            </span>
          </div>
          {overlayModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onModeChange(mode.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                currentMode === mode.id
                  ? 'bg-leaf/20 text-leaf'
                  : 'text-text-secondary hover:bg-forest-light/50'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">{mode.label}</div>
                <div className="text-xs opacity-60">{mode.description}</div>
              </div>
              {currentMode === mode.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-leaf" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapControls;
