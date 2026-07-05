import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

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
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-semibold text-ink"
        >
          <span className="text-rosewood">Till</span>
          <span className="text-forest">We</span>
          <span className="text-ink">Do</span>
        </Link>

        <Card className="text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold-light text-[#8a6d16]">
            <MailCheck size={26} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6d16]">
            One more step
          </p>
          <h1 className="mb-1 font-display text-3xl font-semibold text-ink">Verify your email</h1>
          <p className="mb-7 text-sm text-ink-soft">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-ink">{email || 'your email'}</span>. In development
            it also prints in your backend terminal.
          </p>

          {error && (
            <div className="mb-5 rounded-md border border-danger/20 bg-danger-light px-3.5 py-2.5 text-left text-sm text-danger">
              {error}
            </div>
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
              className="text-center font-mono text-lg tracking-[0.5em]"
              required
            />
            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={otp.length !== 6}>
              Verify
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-rosewood hover:text-brand-dark">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
}
