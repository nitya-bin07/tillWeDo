import { Link } from 'react-router-dom';
import { Wallet, UserPlus, ArrowRight, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PartnerStatus from '../components/couple/PartnerStatus';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { useCouple } from '../context/CoupleContext';
import { useVault } from '../hooks/useVault';
import { formatCurrency, formatDate } from '../utils/format';

function StepCard({ icon: Icon, title, text, to, cta }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-light text-brand">
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mb-4 mt-1 text-sm text-gray-600">{text}</p>
      <Link to={to}>
        <Button size="sm">
          {cta} <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { couple, partner, loading: coupleLoading } = useCouple();
  const { vault, balance, loading: vaultLoading } = useVault();

  const linked = couple && couple.status !== 'pending';
  const hasVault = Boolean(vault);

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-ink">
        Hi, {user?.name?.split(' ')[0] || 'there'} 👋
      </h1>
      <p className="mb-6 text-sm text-gray-500">Here's your shared savings at a glance.</p>

      {coupleLoading || vaultLoading ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          <PartnerStatus couple={couple} partner={partner} />

          {!linked && (
            <StepCard
              icon={UserPlus}
              title="Link with your partner"
              text="Invite your partner with a code (or accept theirs) to create your couple account."
              to="/couple/invite"
              cta="Invite partner"
            />
          )}

          {linked && !hasVault && (
            <StepCard
              icon={Wallet}
              title="Create your vault"
              text="You're linked! Set up your shared savings vault to start contributing."
              to="/vault/setup"
              cta="Set up vault"
            />
          )}

          {hasVault && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{vault.vaultName || 'Your Vault'}</p>
                  <p className="mt-1 text-3xl font-extrabold text-brand">
                    {formatCurrency(balance?.balance ?? vault.balance)}
                  </p>
                </div>
                <Badge status={vault.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">Total contributed</p>
                  <p className="font-semibold text-ink">{formatCurrency(vault.totalContributed)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest earned</p>
                  <p className="flex items-center gap-1 font-semibold text-ink">
                    <TrendingUp size={14} className="text-green-600" />
                    {formatCurrency(vault.totalInterestEarned)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next contribution</p>
                  <p className="font-semibold text-ink">{formatDate(vault.nextContributionDate)}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link to="/vault/history">
                  <Button variant="secondary" size="sm">View history</Button>
                </Link>
                <Link to="/marriage/status">
                  <Button variant="secondary" size="sm">Marriage status</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}