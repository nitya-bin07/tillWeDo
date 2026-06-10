import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
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
    <div className="grid min-h-screen place-items-center bg-brand-light px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-brand">
          <Heart size={22} fill="currentColor" /> TillWeDo
        </Link>
        <h1 className="mb-1 text-center text-2xl font-bold text-ink">Create your account</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Start your journey together</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
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
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}