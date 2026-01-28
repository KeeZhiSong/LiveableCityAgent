const PageSkeleton = () => (
  <div className="h-full w-full animate-pulse p-6 space-y-4">
    <div className="h-6 w-48 bg-forest-light/30 rounded" />
    <div className="h-4 w-72 bg-forest-light/20 rounded" />
    <div className="flex gap-4 mt-8">
      <div className="flex-1 h-64 bg-forest-light/20 rounded-xl" />
      <div className="w-80 space-y-3">
        <div className="h-8 bg-forest-light/20 rounded" />
        <div className="h-8 bg-forest-light/15 rounded" />
        <div className="h-8 bg-forest-light/10 rounded" />
        <div className="h-8 bg-forest-light/15 rounded" />
        <div className="h-8 bg-forest-light/10 rounded" />
      </div>
    </div>
  </div>
);

export default PageSkeleton;
