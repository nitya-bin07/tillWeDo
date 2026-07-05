const tones = {
  brand: 'bg-rosewood-light text-rosewood',
  forest: 'bg-forest-light text-forest',
  gold: 'bg-gold-light text-[#8a6d16]',
  gray: 'bg-ink/[0.06] text-ink-soft',
  green: 'bg-forest-light text-forest',
  yellow: 'bg-gold-light text-[#8a6d16]',
  red: 'bg-danger-light text-danger',
  blue: 'bg-forest-light text-forest',
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
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide ${tones[t]} ${className}`}
    >
      {label}
    </span>
  );
}
