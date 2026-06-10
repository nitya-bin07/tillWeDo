import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, Upload } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/auth';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    dob: user?.dob ? String(user.dob).slice(0, 10) : '',
    location: user?.location || '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setSaving(true);
    try {
      await authApi.updateProfile({
        name: form.name,
        dob: form.dob || undefined,
        location: form.location,
      });
      await refreshUser();
      setMsg('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setMsg('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await authApi.uploadPhoto(fd);
      await refreshUser();
      setMsg('Photo updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
        <User className="text-brand" /> Profile
      </h1>
      <p className="mb-6 text-sm text-gray-500">Manage your account details.</p>

      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-brand-light text-brand">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-lg border border-brand px-3 py-1.5 text-sm text-brand transition hover:bg-brand-light">
              <Upload size={16} /> {uploading ? 'Uploading…' : 'Photo'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading} />
          </label>
        </div>

        {msg && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={save} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Input label="Full name" name="name" value={form.name} onChange={update} required />
          <Input label="Date of birth" name="dob" type="date" value={form.dob} onChange={update} />
          <Input label="Location" name="location" value={form.location} onChange={update} placeholder="City, Country" />
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>

        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-red-600">Danger zone</h3>
          <p className="mb-3 mt-1 text-sm text-gray-500">
            Deleting your account is permanent and can't be undone.
          </p>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} /> Delete account
          </Button>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={doDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          This permanently deletes your account. If you have an active vault or a linked partner,
          you may need to resolve those first.
        </p>
      </Modal>
    </DashboardLayout>
  );
}