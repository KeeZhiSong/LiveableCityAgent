import { Eye, EyeOff } from 'lucide-react';

const StreetViewToggle = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        absolute top-4 left-4 z-[1000] px-4 py-2 rounded-lg
        flex items-center gap-2 font-medium transition-all
        ${enabled
          ? 'bg-leaf text-forest-dark'
          : 'bg-forest/80 backdrop-blur-sm border border-leaf/30 text-leaf hover:border-leaf/50'
        }
      `}
    >
      {enabled ? <EyeOff size={18} /> : <Eye size={18} />}
      {enabled ? 'Exit Street View' : 'Street View Mode'}
    </button>
  );
};

export default StreetViewToggle;
