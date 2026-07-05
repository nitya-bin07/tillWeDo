import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
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

        <Card>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6d16]">
            Welcome back
          </p>
          <h1 className="mb-1 font-display text-3xl font-semibold text-ink">Open your vault</h1>
          <p className="mb-7 text-sm text-ink-soft">Pick up the ledger where you left it.</p>

          {error && (
            <div className="mb-5 rounded-md border border-danger/20 bg-danger-light px-3.5 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email or phone"
              name="emailOrPhone"
              value={form.emailOrPhone}
              onChange={update}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              required
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Log in
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{' '}
          <Link to="/register" className="font-semibold text-rosewood hover:text-brand-dark">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
