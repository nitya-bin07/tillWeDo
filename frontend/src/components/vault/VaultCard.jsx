import { Wallet } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

export default function VaultCard({ vault }) {
  if (!vault) return null;

  const intervalLabel =
    vault.contributionInterval === 'custom'
      ? `Every ${vault.customIntervalDays} days`
      : `Monthly (day ${vault.contributionDay})`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-brand" />
          <h3 className="font-semibold text-ink">{vault.vaultName || 'Our Vault'}</h3>
        </div>
        <Badge status={vault.status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">Partner A monthly</p>
          <p className="font-semibold text-ink">{formatCurrency(vault.monthlyAmountA)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Partner B monthly</p>
          <p className="font-semibold text-ink">{formatCurrency(vault.monthlyAmountB)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Interval</p>
          <p className="font-semibold text-ink">{intervalLabel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Next contribution</p>
          <p className="font-semibold text-ink">{formatDate(vault.nextContributionDate)}</p>
        </div>
      </div>
    </div>
  );
}