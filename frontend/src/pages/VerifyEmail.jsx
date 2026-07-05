import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    <div className="grid min-h-screen place-items-center px-6 py-16 text-center">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-12 block text-center font-display text-2xl italic text-ink">
          TillWeDo<span className="text-accent">.</span>
        </Link>

        <h1 className="mb-2 font-display text-3xl font-normal text-ink">Verify your email</h1>
        <p className="mb-10 text-sm text-ink-soft">
          We sent a 6-digit code to <span className="text-ink">{email || 'your email'}</span>. In
          development it also prints in your backend terminal.
        </p>

        {error && (
          <div className="mb-6 border-l-2 border-danger bg-danger-light px-4 py-3 text-left text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5 text-left">
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

        <p className="mt-10 text-center text-sm text-ink-soft">
          Wrong email?{' '}
          <Link to="/register" className="text-ink underline underline-offset-4">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
}
