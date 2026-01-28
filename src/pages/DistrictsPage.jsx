import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { useAgentContext } from '../contexts/AgentContext';

const metricLabels = {
  airQuality: 'Air Quality',
  transport: 'Transport',
  greenSpace: 'Green Space',
  amenities: 'Amenities',
  safety: 'Safety',
};

function ScoreBar({ value, label }) {
  const color = value >= 70 ? 'bg-leaf' : value >= 50 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-forest-light rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-text-secondary w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

export default function DistrictsPage() {
  const navigate = useNavigate();
  const { districtScores, isLoadingScores } = useAgentContext();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('overall');

  const districts = useMemo(() => {
    return Object.entries(districtScores)
      .map(([name, data]) => ({
        name,
        overall: data.overall || 0,
        airQuality: data.airQuality || 0,
        transport: data.transport || 0,
        greenSpace: data.greenSpace || 0,
        amenities: data.amenities || 0,
        safety: data.safety || 0,
      }))
      .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [districtScores, search, sortBy]);

  if (isLoadingScores) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-text-muted">Loading districts...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">All Districts</h1>

        {/* Search & Sort */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-forest border border-forest-light/50 rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-leaf/40"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-forest border border-forest-light/50 rounded-lg text-text-primary text-sm focus:outline-none focus:border-leaf/40"
          >
            <option value="overall">Sort by Overall</option>
            <option value="airQuality">Sort by Air Quality</option>
            <option value="transport">Sort by Transport</option>
            <option value="greenSpace">Sort by Green Space</option>
            <option value="amenities">Sort by Amenities</option>
            <option value="safety">Sort by Safety</option>
          </select>
        </div>

        {/* Districts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districts.map((district) => (
            <button
              key={district.name}
              onClick={() => navigate('/', { state: { selectedDistrict: district.name } })}
              className="bg-forest/50 rounded-xl border border-forest-light/50 p-4 hover:border-leaf/40 transition-colors text-left"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-text-primary text-sm">{district.name}</h3>
                <span className={`text-2xl font-bold ${
                  district.overall >= 75 ? 'text-leaf' :
                  district.overall >= 60 ? 'text-amber-400' :
                  'text-rose-400'
                }`}>
                  {Math.round(district.overall)}
                </span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(metricLabels).map(([key, label]) => (
                  <ScoreBar key={key} value={district[key]} label={label} />
                ))}
              </div>
            </button>
          ))}
        </div>

        {districts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">No districts found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
