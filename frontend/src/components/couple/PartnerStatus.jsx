import { Heart, UserPlus, Clock } from 'lucide-react';
import Badge from '../common/Badge';

export default function PartnerStatus({ couple, partner }) {
  if (!couple) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-gray-500">
        <UserPlus size={22} className="text-brand" />
        <span>No partner linked yet — invite your partner to begin.</span>
      </div>
    );
  }

  const pending = couple.status === 'pending';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-light text-brand">
            {pending ? <Clock size={20} /> : <Heart size={20} fill="currentColor" />}
          </div>
          <div>
            <p className="font-semibold text-ink">
              {pending ? 'Waiting for your partner…' : partner?.name || 'Your partner'}
            </p>
            <p className="text-sm text-gray-500">
              {pending ? 'Invite sent — share your code' : partner?.email || ''}
            </p>
          </div>
        </div>
        <Badge status={couple.status} />
      </div>
    </div>
  );
}