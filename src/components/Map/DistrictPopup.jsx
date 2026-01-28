import { getScoreColor, getScoreLabel } from '../../utils/scoreUtils';

const DistrictPopup = ({ district, score }) => {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="min-w-[150px]">
      <h3 className="font-semibold text-text-primary text-base mb-2">
        {district}
      </h3>
      <div className="flex items-center gap-2">
        <span
          className="text-2xl font-mono font-bold"
          style={{ color: scoreColor }}
        >
          {score}
        </span>
        <span className="text-text-secondary text-sm">/100</span>
      </div>
      <span
        className="text-xs font-medium mt-1 inline-block"
        style={{ color: scoreColor }}
      >
        {scoreLabel}
      </span>
    </div>
  );
};

export default DistrictPopup;
