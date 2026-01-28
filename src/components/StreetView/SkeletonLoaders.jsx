// Skeleton loader components for better perceived performance

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-forest-light/50 rounded ${className}`} />
);

// Skeleton for environment data grid
export const EnvironmentSkeleton = () => (
  <div className="grid grid-cols-2 gap-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-forest/50 border border-forest-light/50 rounded-lg p-3 flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton for amenity list items
export const AmenitySkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 bg-forest/50 rounded-lg border border-forest-light/30"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-12" />
      </div>
    ))}
  </div>
);

// Skeleton for walkability score
export const WalkabilityScoreSkeleton = () => (
  <div className="bg-forest/50 border border-forest-light/50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-12" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
  </div>
);

// Skeleton for mini-map
export const MiniMapSkeleton = () => (
  <div className="bg-forest/50 border border-forest-light/50 rounded-lg overflow-hidden">
    <Skeleton className="h-40 w-full" />
  </div>
);

export default Skeleton;
