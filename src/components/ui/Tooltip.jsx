import { useState } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-forest border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-forest border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-forest border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-forest border-y-transparent border-l-transparent'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && content && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-text-primary bg-forest border border-forest-light/50 rounded-lg shadow-lg whitespace-nowrap ${positions[position]}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrows[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
