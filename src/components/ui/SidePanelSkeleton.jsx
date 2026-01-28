const SidePanelSkeleton = () => (
  <div className="animate-pulse p-4 space-y-6">
    {/* District name + score ring */}
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-forest-light/30" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-32 bg-forest-light/30 rounded" />
        <div className="h-3 w-20 bg-forest-light/20 rounded" />
      </div>
    </div>

    {/* Score breakdown bars */}
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-forest-light/20 rounded" />
            <div className="h-3 w-8 bg-forest-light/20 rounded" />
          </div>
          <div className="h-2 w-full bg-forest-light/15 rounded-full" />
        </div>
      ))}
    </div>

    {/* Agent panel placeholder */}
    <div className="space-y-3 pt-2">
      <div className="h-4 w-28 bg-forest-light/20 rounded" />
      <div className="h-20 bg-forest-light/10 rounded-xl" />
      <div className="h-20 bg-forest-light/10 rounded-xl" />
    </div>
  </div>
);

export default SidePanelSkeleton;
