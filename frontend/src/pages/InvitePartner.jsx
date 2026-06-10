import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, KeyRound } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import InviteCodeCard from '../components/couple/InviteCodeCard';
import PartnerStatus from '../components/couple/PartnerStatus';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useCouple } from '../context/CoupleContext';
import * as coupleApi from '../api/couple';

export default function InvitePartner() {
  const { couple, partner, inviteCode, loading, refreshCouple } = useCouple();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    setGenerating(true);
    try {
      await coupleApi.createInvite();
      await refreshCouple();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const cancel = async () => {
    setError('');
    setCancelling(true);
    try {
      await coupleApi.unlink();
      await refreshCouple();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const linked = couple && couple.status !== 'pending';
  const pending = couple && couple.status === 'pending';

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-ink">Invite your partner</h1>
      <p className="mb-6 text-sm text-gray-500">
        One of you generates a code; the other joins with it. (Only one person needs to invite.)
      </p>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          <PartnerStatus couple={couple} partner={partner} />

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          {linked ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <p className="text-gray-600">You're linked with your partner! 🎉</p>
              <Button className="mt-4" onClick={() => navigate('/vault/setup')}>
                Set up your vault
              </Button>
            </div>
          ) : pending && inviteCode ? (
            <>
              <InviteCodeCard code={inviteCode} />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">
                  Has your partner already sent <em>you</em> a code instead?
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancel} loading={cancelling}>
                    Cancel my invite
                  </Button>
                  <Link to="/couple/join">
                    <Button variant="secondary" size="sm">
                      <KeyRound size={16} /> Join with a code
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <UserPlus size={32} className="mx-auto mb-3 text-brand" />
              <p className="mb-4 text-gray-600">Create an invite code to send your partner.</p>
              <Button onClick={generate} loading={generating}>
                Generate invite code
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                Already have a code from your partner?{' '}
                <Link to="/couple/join" className="font-medium text-brand">
                  Join instead
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}