import { X, MapPin, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CompareModal = ({ locations = [], onClose }) => {
  if (locations.length < 2) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-leaf';
    if (score >= 60) return 'text-lime-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBgColor = (score) => {
    if (score >= 80) return 'bg-leaf/10';
    if (score >= 60) return 'bg-lime-400/10';
    if (score >= 40) return 'bg-amber-400/10';
    return 'bg-rose-400/10';
  };

  // Sort by score to find best/worst
  const sortedLocations = [...locations].sort((a, b) => b.score - a.score);
  const bestScore = sortedLocations[0].score;
  const worstScore = sortedLocations[sortedLocations.length - 1].score;

  const getAmenityCount = (location) => {
    return location.amenities?.length || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-forest-dark border border-forest-light/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-forest-light/50">
          <h2 className="text-lg font-semibold text-leaf">Compare Locations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-forest-light rounded-lg transition-colors"
          >
            <X size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Comparison grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(locations.length, 3)}, 1fr)` }}>
            {locations.slice(0, 3).map((location, index) => {
              const isBest = location.score === bestScore;
              const isWorst = location.score === worstScore && locations.length > 1;

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    isBest ? 'border-leaf/40 bg-leaf/5' : 'border-forest-light/50 bg-forest/30'
                  }`}
                >
                  {/* Location header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-leaf" />
                      <span className="text-text-primary text-sm font-medium truncate max-w-[120px]">
                        {location.address || `Location ${index + 1}`}
                      </span>
                    </div>
                    {isBest && (
                      <div className="flex items-center gap-1 bg-leaf/20 px-2 py-0.5 rounded-full">
                        <Trophy size={12} className="text-leaf" />
                        <span className="text-leaf text-xs font-medium">Best</span>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className={`rounded-lg p-3 mb-3 ${getBgColor(location.score)}`}>
                    <p className="text-text-muted text-xs mb-1">Walkability Score</p>
                    <p className={`text-3xl font-mono font-bold ${getScoreColor(location.score)}`}>
                      {location.score}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Amenities nearby</span>
                      <span className="text-text-primary font-medium">
                        {getAmenityCount(location)}
                      </span>
                    </div>
                    {location.dengueStatus?.inCluster && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Dengue cluster</span>
                        <span className="text-rose-400 font-medium">
                          {location.dengueStatus.distance}m
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comparison indicators */}
                  {locations.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-forest-light/30">
                      <div className="flex items-center gap-2">
                        {isBest ? (
                          <>
                            <TrendingUp size={14} className="text-leaf" />
                            <span className="text-leaf text-xs">
                              +{location.score - worstScore} vs lowest
                            </span>
                          </>
                        ) : isWorst ? (
                          <>
                            <TrendingDown size={14} className="text-rose-400" />
                            <span className="text-rose-400 text-xs">
                              {location.score - bestScore} vs best
                            </span>
                          </>
                        ) : (
                          <>
                            <Minus size={14} className="text-text-muted" />
                            <span className="text-text-muted text-xs">
                              {location.score - bestScore} vs best
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {locations.length > 3 && (
            <p className="text-text-muted text-sm text-center mt-4">
              Showing top 3 of {locations.length} saved locations
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-forest-light/50 bg-forest/30">
          <p className="text-text-secondary text-sm text-center">
            Scores based on proximity to amenities, green spaces, and health factors
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
