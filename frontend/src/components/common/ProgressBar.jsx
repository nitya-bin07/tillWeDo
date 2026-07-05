export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  tone = 'brand',
  className = '',
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar = tone === 'forest' ? 'bg-forest' : tone === 'gold' ? 'bg-gold' : 'bg-brand';
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex justify-between font-mono text-sm text-ink-soft">
          <span className="font-sans">{label}</span>
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.08]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
