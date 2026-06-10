export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          <span>{label}</span>
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}