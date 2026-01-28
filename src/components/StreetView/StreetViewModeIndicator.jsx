import { MapPin, X } from 'lucide-react';

const StreetViewModeIndicator = ({ onExit }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in">
      <div className="flex items-center gap-3 bg-forest-dark/95 backdrop-blur-sm border border-leaf/30 rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin size={18} className="text-leaf" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-leaf rounded-full animate-pulse" />
          </div>
          <span className="text-text-primary text-sm font-medium">
            Street View Mode
          </span>
        </div>
        <div className="w-px h-4 bg-leaf/30" />
        <span className="text-text-secondary text-sm">
          Click anywhere on the map to explore
        </span>
        <button
          onClick={onExit}
          className="ml-2 p-1 hover:bg-forest-light rounded-full transition-colors"
          title="Exit street view mode"
        >
          <X size={16} className="text-text-secondary hover:text-text-primary" />
        </button>
      </div>
    </div>
  );
};

export default StreetViewModeIndicator;
