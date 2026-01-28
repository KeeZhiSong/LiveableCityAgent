import { useState } from 'react';
import { Layers } from 'lucide-react';
import { LAYER_CONFIG } from './AmenityLayers';

export default function LayerControlPanel({ activeLayers, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          open
            ? 'bg-leaf text-forest-dark'
            : 'bg-forest/90 backdrop-blur border border-forest-light/50 hover:border-leaf/40 text-text-secondary'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="text-sm">Layers</span>
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-xl bg-forest-dark/95 backdrop-blur border border-forest-light/30 min-w-[180px] space-y-1">
          {Object.entries(LAYER_CONFIG).map(([key, config]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-forest-light/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={!!activeLayers[key]}
                onChange={() => onToggle(key)}
                className="sr-only peer"
              />
              <span
                className="w-3 h-3 rounded-full border-2 peer-checked:border-transparent transition-colors"
                style={{
                  borderColor: activeLayers[key] ? config.color : 'rgba(255,255,255,0.2)',
                  backgroundColor: activeLayers[key] ? config.color : 'transparent',
                }}
              />
              <span className="text-xs text-text-secondary peer-checked:text-text-primary transition-colors">
                {config.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
