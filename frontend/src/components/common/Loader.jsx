import { Loader2 } from 'lucide-react';

export default function Loader({ fullScreen = false, label = 'Loading…', size = 26 }) {
  const spinner = (
    <div className="flex flex-col items-center gap-2 text-ink">
      <Loader2 size={size} className="animate-spin" />
      {label && <span className="font-sans text-sm text-ink-soft">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-paper/85 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }
  return <div className="grid place-items-center py-10">{spinner}</div>;
}
