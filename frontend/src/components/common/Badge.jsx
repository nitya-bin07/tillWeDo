const tones = {
  brand: 'bg-brand-light text-brand-dark',
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

const statusTone = {
  setup: 'blue',
  active: 'green',
  paused: 'yellow',
  forfeited: 'red',
  paid_out: 'brand',
  pending: 'yellow',
  accepted: 'green',
  broken_up: 'red',
  married: 'brand',
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
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tones[t]} ${className}`}
    >
      {label}
    </span>
  );
}