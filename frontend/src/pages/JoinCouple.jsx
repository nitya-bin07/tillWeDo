import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useCouple } from '../context/CoupleContext';
import * as coupleApi from '../api/couple';

export default function JoinCouple() {
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refreshCouple } = useCouple();

  const [code, setCode] = useState(codeParam || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/couple/join/${codeParam || ''}` } } });
    }
  }, [authLoading, isAuthenticated, codeParam, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await coupleApi.acceptInvite({ inviteCode: code.trim() });
      await refreshCouple();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-2xl font-bold text-ink">Join your partner</h1>
        <p className="mb-6 text-sm text-gray-500">Enter the invite code your partner shared with you.</p>

        {success ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <Heart size={32} className="mx-auto mb-3 text-brand" fill="currentColor" />
            <p className="font-semibold text-ink">Linked! Taking you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <Input
              label="Invite code"
              name="inviteCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD"
              className="font-mono tracking-widest"
              required
            />
            <Button type="submit" className="w-full" loading={loading} disabled={code.trim().length < 4}>
              Link with partner
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}