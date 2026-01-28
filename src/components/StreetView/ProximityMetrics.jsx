import { Train, Bus, Trees, Utensils, Building, ShoppingBag, GraduationCap, Heart, Dumbbell, Bike, Baby, AlertTriangle, Navigation, MapPin } from 'lucide-react';

const amenityIcons = {
  mrt: Train,
  bus: Bus,
  park: Trees,
  hawker: Utensils,
  mall: ShoppingBag,
  school: GraduationCap,
  hospital: Heart,
  building: Building,
  supermarket: ShoppingBag,
  childcare: Baby,
  preschool: GraduationCap,
  gym: Dumbbell,
  cycling: Bike,
  dengue: AlertTriangle,
};

const getDistanceColor = (distance) => {
  if (distance <= 300) return 'text-leaf';
  if (distance <= 500) return 'text-lime-400';
  if (distance <= 800) return 'text-amber-400';
  return 'text-rose-400';
};

const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

const ProximityMetrics = ({ data, onAmenityClick }) => {
  if (!data || !data.amenities) return null;

  const hasClickHandler = typeof onAmenityClick === 'function';

  return (
    <div className="space-y-2">
      {/* Dengue cluster warning */}
      {data.dengueStatus?.inCluster && (
        <div className="flex items-center justify-between p-3 bg-rose-500/20 rounded-lg border border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
            <div>
              <p className="text-rose-300 text-sm font-medium">Dengue Cluster Nearby</p>
              <p className="text-rose-300/70 text-xs">Take precautions against mosquitoes</p>
            </div>
          </div>
          <span className="font-mono font-semibold text-rose-400">
            {formatDistance(data.dengueStatus.distance)}
          </span>
        </div>
      )}

      {/* Amenities list */}
      {data.amenities.map((amenity, index) => {
        const Icon = amenityIcons[amenity.type] || Building;
        const canNavigate = hasClickHandler && amenity.lat && amenity.lng;

        return (
          <div
            key={index}
            className={`flex items-center justify-between p-3 bg-forest/50 rounded-lg border border-forest-light/30 group ${
              canNavigate ? 'hover:border-leaf/30 transition-colors' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-leaf/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-leaf" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-sm font-medium truncate">{amenity.name}</p>
                <p className="text-text-muted text-xs capitalize">{amenity.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-semibold ${getDistanceColor(amenity.distance)}`}>
                {formatDistance(amenity.distance)}
              </span>
              {canNavigate && (
                <button
                  onClick={() => onAmenityClick(amenity)}
                  className="p-1.5 rounded-lg bg-forest-light/50 hover:bg-leaf/20 transition-colors opacity-0 group-hover:opacity-100"
                  title="View on map"
                >
                  <Navigation size={14} className="text-leaf" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Improved empty state */}
      {data.amenities.length === 0 && !data.dengueStatus?.inCluster && (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-forest-light/30 flex items-center justify-center">
            <MapPin size={24} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm font-medium mb-1">
            No amenities found nearby
          </p>
          <p className="text-text-muted text-xs">
            Try exploring a different area or check the mini-map for the nearest facilities
          </p>
        </div>
      )}
    </div>
  );
};

export default ProximityMetrics;
