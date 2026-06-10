import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/format';
import * as adminApi from '../../api/admin';

export default function AdminVaults() {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [working, setWorking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllVaults({ page, limit: 15 });
      setVaults(res.data.vaults || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const payout = async (vaultId) => {
    setWorking(vaultId);
    setError('');
    try {
      await adminApi.triggerPayout(vaultId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-ink">All vaults</h1>
      <p className="mb-6 text-sm text-gray-500">Every vault on the platform.</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Vault</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Balance</th>
                <th className="px-4 py-2 font-medium">Next</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {vaults.map((v) => (
                <tr key={v._id} className="border-t border-gray-50">
                  <td className="px-4 py-2 text-gray-700">{v.vaultName || 'Our Vault'}</td>
                  <td className="px-4 py-2">
                    <Badge status={v.status} />
                  </td>
                  <td className="px-4 py-2 text-gray-700">{formatCurrency(v.balance)}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(v.nextContributionDate)}</td>
                  <td className="px-4 py-2 text-right">
                    {['active', 'paused'].includes(v.status) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={working === v._id}
                        onClick={() => payout(v._id)}
                      >
                        Force payout
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {vaults.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No vaults yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
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
    </DashboardLayout>
  );
}