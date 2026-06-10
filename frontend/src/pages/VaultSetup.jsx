import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useVault } from '../hooks/useVault';
import { useCouple } from '../context/CoupleContext';
import * as vaultApi from '../api/vault';

export default function VaultSetup() {
  const navigate = useNavigate();
  const { vault, refreshVault } = useVault();
  const { couple } = useCouple();

  const existing = vault && vault.status === 'setup' ? vault : null;
  const lockedActive = vault && vault.status !== 'setup';
  const linked = couple && couple.status !== 'pending';

  const aName = couple?.partnerA?.name?.split(' ')[0] || 'Partner A';
  const bName = couple?.partnerB?.name?.split(' ')[0] || 'Partner B';

  const [form, setForm] = useState({
    vaultName: existing?.vaultName || '',
    monthlyAmountA: existing?.monthlyAmountA || '',
    monthlyAmountB: existing?.monthlyAmountB || '',
    contributionInterval: existing?.contributionInterval || 'monthly',
    contributionDay: existing?.contributionDay || 1,
    customIntervalDays: existing?.customIntervalDays || 30,
    startDate: existing?.startDate ? String(existing.startDate).slice(0, 10) : '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        monthlyAmountA: Number(form.monthlyAmountA),
        monthlyAmountB: Number(form.monthlyAmountB),
        contributionInterval: form.contributionInterval,
        startDate: form.startDate,
      };
      if (form.vaultName.trim()) payload.vaultName = form.vaultName.trim();
      if (form.contributionInterval === 'monthly') {
        payload.contributionDay = Number(form.contributionDay);
      } else {
        payload.customIntervalDays = Number(form.customIntervalDays);
      }

      await vaultApi.setupVault(payload);
      await refreshVault();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (lockedActive) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            Your vault is already <strong>{vault.status}</strong> — settings can't be changed here.
          </p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
        <Wallet className="text-brand" /> Set up your vault
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Choose how much each of you contributes and when. Only one partner needs to do this.
      </p>

      {!linked ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Link with your partner first before creating a vault.
          <div className="mt-4">
            <Button onClick={() => navigate('/couple/invite')}>Invite partner</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <Input
            label="Vault name (optional)"
            name="vaultName"
            value={form.vaultName}
            onChange={update}
            placeholder="Our Future"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`${aName}'s monthly (₹)`}
              name="monthlyAmountA"
              type="number"
              min="1"
              value={form.monthlyAmountA}
              onChange={update}
              required
            />
            <Input
              label={`${bName}'s monthly (₹)`}
              name="monthlyAmountB"
              type="number"
              min="1"
              value={form.monthlyAmountB}
              onChange={update}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contribution interval</label>
            <select
              name="contributionInterval"
              value={form.contributionInterval}
              onChange={update}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
            >
              <option value="monthly">Monthly</option>
              <option value="custom">Custom (every N days)</option>
            </select>
          </div>

          {form.contributionInterval === 'monthly' ? (
            <Input
              label="Day of month (1–28)"
              name="contributionDay"
              type="number"
              min="1"
              max="28"
              value={form.contributionDay}
              onChange={update}
              required
            />
          ) : (
            <Input
              label="Every N days (1–365)"
              name="customIntervalDays"
              type="number"
              min="1"
              max="365"
              value={form.customIntervalDays}
              onChange={update}
              required
            />
          )}

          <Input
            label="Start date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={update}
            required
          />

          <div className="rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">
            Interest is set by the platform and accrues monthly — no need to configure it.
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            {existing ? 'Update vault' : 'Create vault'}
          </Button>
        </form>
      )}
    </DashboardLayout>
  );
}