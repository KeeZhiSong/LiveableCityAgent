import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-forest-light/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-forest/30 hover:bg-forest/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-leaf" />}
          <span className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {title}
          </span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-leaf/20 text-leaf rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
