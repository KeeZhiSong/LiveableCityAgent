import { X, MapPin, ArrowRight } from 'lucide-react';

const SavedLocations = ({ locations = [], currentLocation, onSelect, onRemove, onCompare }) => {
  if (locations.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-text-muted text-sm">
          No saved locations yet. Click the pin icon to save this location.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-leaf';
    if (score >= 60) return 'text-lime-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-2">
      {locations.map((location, index) => {
        const isCurrentLocation =
          currentLocation &&
          Math.abs(location.lat - currentLocation.lat) < 0.0001 &&
          Math.abs(location.lng - currentLocation.lng) < 0.0001;

        return (
          <div
            key={index}
            className={`relative flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
              isCurrentLocation
                ? 'bg-leaf/10 border-leaf/30'
                : 'bg-forest/50 border-forest-light/30 hover:border-leaf/30'
            }`}
            onClick={() => onSelect(location)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrentLocation ? 'bg-leaf/20' : 'bg-forest-light'
                }`}
              >
                <MapPin size={16} className={isCurrentLocation ? 'text-leaf' : 'text-text-secondary'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium truncate">
                  {location.address || `Location ${index + 1}`}
                </p>
                <p className="text-text-muted text-xs font-mono">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-semibold ${getScoreColor(location.score)}`}>
                {location.score}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="p-1 hover:bg-forest-light rounded transition-colors"
                title="Remove"
              >
                <X size={14} className="text-text-muted hover:text-rose-400" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Compare button */}
      {locations.length >= 2 && (
        <button
          onClick={onCompare}
          className="w-full mt-3 py-2 px-4 bg-teal/20 hover:bg-teal/30 border border-teal/30 rounded-lg text-teal font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          Compare {locations.length} Locations
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

export default SavedLocations;
