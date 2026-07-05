export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  tone = 'ink',
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar = tone === 'forest' ? 'bg-forest' : tone === 'gold' ? 'bg-accent' : 'bg-ink';
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex justify-between font-mono text-xs text-ink-soft">
          <span className="font-sans">{label}</span>
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
