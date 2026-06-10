import { useEffect, useState } from 'react';
import { Users, Heart, Wallet, Banknote, FileClock, TrendingDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/admin/StatCard';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/format';
import * as adminApi from '../../api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-ink">Admin dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Platform-wide overview.</p>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      ) : (
        stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Users} label="Total users" value={stats.users} tone="blue" />
            <StatCard icon={Heart} label="Active couples" value={stats.couples?.active || 0} tone="brand" />
            <StatCard icon={Heart} label="Married" value={stats.couples?.married || 0} tone="green" />
            <StatCard icon={Wallet} label="Active vaults" value={stats.vaults?.active || 0} tone="blue" />
            <StatCard icon={Banknote} label="Money locked" value={formatCurrency(stats.totalActiveBalance)} tone="green" />
            <StatCard icon={FileClock} label="Pending proofs" value={stats.pendingMarriageProofs} tone="gray" />
            <StatCard icon={Banknote} label="Total paid out" value={formatCurrency(stats.paidOut?.total)} tone="green" />
            <StatCard icon={TrendingDown} label="Total forfeited" value={formatCurrency(stats.forfeited?.total)} tone="red" />
          </div>
        )
      )}
    </DashboardLayout>
  );
}