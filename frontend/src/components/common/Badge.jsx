const tones = {
  brand: 'bg-ink/[0.06] text-ink',
  forest: 'bg-forest-light text-forest',
  gold: 'bg-accent-light text-accent',
  gray: 'bg-ink/[0.06] text-ink-soft',
  green: 'bg-forest-light text-forest',
  yellow: 'bg-accent-light text-accent',
  red: 'bg-danger-light text-danger',
  blue: 'bg-ink/[0.06] text-ink-soft',
};

const statusTone = {
  setup: 'blue',
  active: 'green',
  paused: 'yellow',
  forfeited: 'red',
  paid_out: 'gold',
  pending: 'yellow',
  accepted: 'green',
  broken_up: 'red',
  married: 'gold',
  under_review: 'blue',
  approved: 'green',
  rejected: 'red',
  paid: 'green',
  failed: 'red',
  grace: 'yellow',
};

export default function Badge({ children, tone, status, className = '' }) {
  const t = tone || statusTone[status] || 'gray';
  const label = children || (status ? status.replace(/_/g, ' ') : '');
  return (
    <span
      className={`inline-block rounded-sm px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide ${tones[t]} ${className}`}
    >
      {label}
    </span>
  );
}
