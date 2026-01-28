import { Leaf } from 'lucide-react';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-forest-dark/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Leaf className="w-16 h-16 text-leaf animate-float" />
        <div className="absolute inset-0 blur-xl bg-leaf/20 rounded-full animate-pulse" />
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <span className="text-lg text-text-secondary">{message}</span>
        <div className="w-48 space-y-2 animate-pulse">
          <div className="h-2 bg-forest-light/30 rounded-full" />
          <div className="h-2 bg-forest-light/20 rounded-full w-3/4 mx-auto" />
          <div className="h-2 bg-forest-light/15 rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
