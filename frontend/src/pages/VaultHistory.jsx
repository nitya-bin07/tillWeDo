import { useEffect, useState } from 'react';
import { History as HistoryIcon, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import BalanceDisplay from '../components/vault/BalanceDisplay';
import ContributionList from '../components/vault/ContributionList';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { useVault } from '../hooks/useVault';
import { useCouple } from '../context/CoupleContext';
import { formatCurrency } from '../utils/format';

export default function VaultHistory() {
  const { vault, balance, contributions, refreshContributions } = useVault();
  const { couple } = useCouple();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const aName = couple?.partnerA?.name?.split(' ')[0] || 'Partner A';
  const bName = couple?.partnerB?.name?.split(' ')[0] || 'Partner B';

  useEffect(() => {
    let active = true;
    setLoading(true);
    refreshContributions({ page, limit: 10 })
      .then((data) => {
        if (active) setPagination(data?.pagination || null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, refreshContributions]);

  if (!vault) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          No vault yet — create one to see history.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
        <HistoryIcon className="text-brand" /> Vault history
      </h1>
      <p className="mb-6 text-sm text-gray-500">Your contributions and interest over time.</p>

      <div className="space-y-5">
        <BalanceDisplay
          balance={balance?.balance ?? vault.balance}
          totalContributed={vault.totalContributed}
          totalInterestEarned={vault.totalInterestEarned}
          interestRate={balance?.interestRate ?? vault.interestRate}
        />

        {balance?.projectedMonthlyInterest != null && (
          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
            <TrendingUp size={16} className="text-green-600" />
            Projected interest next month:{' '}
            <span className="font-semibold text-ink">
              {formatCurrency(balance.projectedMonthlyInterest)}
            </span>
          </div>
        )}

        <h2 className="text-lg font-semibold text-ink">Contributions</h2>
        {loading ? (
          <Loader />
        ) : (
          <ContributionList contributions={contributions} labelA={aName} labelB={bName} />
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}