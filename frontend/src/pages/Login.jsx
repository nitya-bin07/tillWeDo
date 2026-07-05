import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-12 block text-center font-display text-2xl italic text-ink">
          TillWeDo<span className="text-accent">.</span>
        </Link>

        <h1 className="mb-2 font-display text-3xl font-normal text-ink">Welcome back</h1>
        <p className="mb-10 text-sm text-ink-soft">Pick up your vault where you left it.</p>

        {error && (
          <div className="mb-6 border-l-2 border-danger bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
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

        <p className="mt-10 text-center text-sm text-ink-soft">
          New here?{' '}
          <Link to="/register" className="text-ink underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
