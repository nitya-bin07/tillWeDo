import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
    <div className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-12 block text-center font-display text-2xl italic text-ink">
          TillWeDo<span className="text-accent">.</span>
        </Link>

        <h1 className="mb-2 font-display text-3xl font-normal text-ink">Open an account</h1>
        <p className="mb-10 text-sm text-ink-soft">Start a savings history you'll write together.</p>

        {error && (
          <div className="mb-6 border-l-2 border-danger bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
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

        <p className="mt-10 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
