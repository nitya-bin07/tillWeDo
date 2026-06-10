import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function BalanceDisplay({ balance, totalContributed, totalInterestEarned, interestRate }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-sm">
      <p className="text-sm opacity-80">Vault balance</p>
      <p className="mt-1 text-4xl font-extrabold">{formatCurrency(balance)}</p>
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="opacity-80">Contributed</p>
          <p className="font-semibold">{formatCurrency(totalContributed)}</p>
        </div>
        <div>
          <p className="opacity-80">Interest earned</p>
          <p className="flex items-center gap-1 font-semibold">
            <TrendingUp size={14} /> {formatCurrency(totalInterestEarned)}
          </p>
        </div>
        {interestRate != null && (
          <div>
            <p className="opacity-80">Rate</p>
            <p className="font-semibold">{interestRate}% p.a.</p>
          </div>
        )}
      </div>
    </div>
  );
}