const legendItems = [
  { label: '80+ Excellent', color: '#22c55e' },
  { label: '60-79 Good', color: '#84cc16' },
  { label: '40-59 Fair', color: '#f59e0b' },
  { label: '<40 Poor', color: '#f43f5e' }
];

const MapLegend = () => {
  return (
    <div className="absolute bottom-20 left-4 z-[1000] card-glass p-3">
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
        Liveability Score
      </h4>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
