import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';

const COLUMNS = [
  { key: 'overall', label: 'Overall' },
  { key: 'airQuality', label: 'Air' },
  { key: 'transport', label: 'Transport' },
  { key: 'greenSpace', label: 'Green' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'safety', label: 'Safety' },
];

function cellColor(score) {
  if (score >= 80) return 'bg-leaf/30 text-leaf';
  if (score >= 70) return 'bg-lime-500/20 text-lime-400';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400';
  if (score >= 50) return 'bg-orange-500/20 text-orange-400';
  return 'bg-rose-500/20 text-rose-400';
}

export default function DistrictHeatmap({ districts }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('overall');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...districts].sort((a, b) => {
    const diff = (a[sortKey] || 0) - (b[sortKey] || 0);
    return sortAsc ? diff : -diff;
  });

  return (
    <div className="rounded-xl bg-forest/50 border border-forest-light/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-forest-light/20">
        <h3 className="text-sm font-semibold text-text-primary">District Score Heatmap</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-forest-light/20">
              <th className="text-left px-3 py-2 text-text-muted font-medium sticky left-0 bg-forest-dark/90 z-10">
                District
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-2 py-2 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <ArrowUpDown className="w-3 h-3 text-teal" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr
                key={d.name}
                onClick={() => navigate('/', { state: { selectedDistrict: d.name } })}
                className="border-b border-forest-light/10 hover:bg-forest-light/10 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2 text-text-primary font-medium whitespace-nowrap sticky left-0 bg-forest-dark/90 z-10">
                  {d.name}
                </td>
                {COLUMNS.map((col) => {
                  const val = d[col.key] || 0;
                  return (
                    <td key={col.key} className="px-2 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tabular-nums ${cellColor(val)}`}>
                        {val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
