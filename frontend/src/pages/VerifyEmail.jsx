import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function VerifyEmail() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const presetEmail = location.state?.email || user?.email || '';
  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      await refreshUser().catch(() => {});
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand-light px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand">
          <MailCheck size={28} />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-ink">Verify your email</h1>
        <p className="mb-6 text-sm text-gray-500">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-700">{email || 'your email'}</span>. In development
          it also prints in your backend terminal.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4 text-left">
          {!presetEmail && (
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <Input
            label="6-digit code"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            className="text-center text-lg tracking-widest"
            required
          />
          <Button type="submit" className="w-full" loading={loading} disabled={otp.length !== 6}>
            Verify
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Wrong email?{' '}
          <Link to="/register" className="font-medium text-brand">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
}