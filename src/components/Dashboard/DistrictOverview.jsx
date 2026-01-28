import { MapPin, Users, Maximize2 } from 'lucide-react';
import ScoreRing from './ScoreRing';
import { Card } from '../ui';

const DistrictOverview = ({
  district,
  score,
  envScore,
  population,
  area,
  className = ''
}) => {
  const formatPopulation = (pop) => {
    if (!pop) return 'N/A';
    return pop.toLocaleString();
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex flex-col items-center">
        {/* District name */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-leaf" />
          <h2 className="text-xl font-bold text-text-primary">{district}</h2>
        </div>

        {/* Dual score rings */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex flex-col items-center">
            <ScoreRing score={score} size="sm" showLabel={false} />
            <span className="mt-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Liveability</span>
          </div>
          {envScore != null && (
            <div className="flex flex-col items-center">
              <ScoreRing score={envScore} size="sm" showLabel={false} />
              <span className="mt-1.5 text-[10px] font-semibold text-teal uppercase tracking-wider">Environmental</span>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Users className="w-4 h-4" />
            <span>{formatPopulation(population)}</span>
          </div>
          {area && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Maximize2 className="w-4 h-4" />
              <span>{area}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DistrictOverview;
