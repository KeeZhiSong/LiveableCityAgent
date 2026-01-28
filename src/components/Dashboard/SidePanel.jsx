import { X } from 'lucide-react';
import DistrictOverview from './DistrictOverview';
import ScoreBreakdown from './ScoreBreakdown';
import SidePanelSkeleton from '../ui/SidePanelSkeleton';
import { Button } from '../ui';

const SidePanel = ({
  district,
  districtData,
  isLoading,
  onClose,
  onMetricClick,
  overviewContent,
  children
}) => {
  if (!district) {
    return (
      <div data-tour="side-panel" className="w-[400px] h-full bg-forest-dark border-l border-forest-light/30 flex flex-col overflow-hidden">
        <div className="flex items-center p-4 border-b border-forest-light/30">
          <h2 className="text-lg font-semibold text-text-primary">Singapore Overview</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center p-4 rounded-xl bg-forest/30 border border-forest-light/20">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-forest flex items-center justify-center">
              <svg
                className="w-6 h-6 text-leaf/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              Click on any district on the map to view detailed scores and AI insights.
            </p>
          </div>
          {overviewContent}
        </div>
      </div>
    );
  }

  return (
    <div data-tour="side-panel" className="w-[400px] h-full bg-forest-dark border-l border-forest-light/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-forest-light/30">
        <h2 className="text-lg font-semibold text-text-primary">District Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <SidePanelSkeleton />
        ) : (
          <>
            <DistrictOverview
              district={district}
              score={districtData?.scores?.overall || 0}
              envScore={districtData?.envScores?.envOverall ?? null}
              population={districtData?.population}
              area={districtData?.area}
            />

            <ScoreBreakdown
              breakdown={districtData?.scores?.breakdown || {}}
              envBreakdown={districtData?.envScores?.envBreakdown}
              onMetricClick={onMetricClick}
            />

            {/* Agent insights and other children */}
            {children}
          </>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
