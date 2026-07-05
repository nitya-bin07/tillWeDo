import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.location) delete payload.location;
      await register(payload);
      navigate('/verify-email', { state: { email: form.email } });
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
            Entry No. 01
          </p>
          <h1 className="mb-1 font-display text-3xl font-semibold text-ink">Open your account</h1>
          <p className="mb-7 text-sm text-ink-soft">
            The first entry in a savings story you'll write together.
          </p>

          {error && (
            <div className="mb-5 rounded-md border border-danger/20 bg-danger-light px-3.5 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input label="Full name" name="name" value={form.name} onChange={update} required />
            <Input label="Email" name="email" type="email" value={form.email} onChange={update} required />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="9876543210"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              placeholder="At least 8 characters"
              required
            />
            <Input label="Date of birth" name="dob" type="date" value={form.dob} onChange={update} required />
            <Input label="Location (optional)" name="location" value={form.location} onChange={update} />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-rosewood hover:text-brand-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
