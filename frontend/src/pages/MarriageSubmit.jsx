import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Upload } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import * as marriageApi from '../api/marriage';

const fileInputClass =
  'block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-light file:px-4 file:py-2 file:text-brand-dark';

export default function MarriageSubmit() {
  const navigate = useNavigate();
  const [marriageDate, setMarriageDate] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!certificate) {
      setError('Please attach your marriage certificate.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('certificate', certificate);
      photos.slice(0, 5).forEach((p) => fd.append('photos', p));
      fd.append('marriageDate', marriageDate);
      if (registrationNumber.trim()) fd.append('registrationNumber', registrationNumber.trim());
      await marriageApi.submitProof(fd);
      navigate('/marriage/status');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
        <Heart className="text-brand" fill="currentColor" /> Submit marriage proof
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Upload your certificate to unlock your vault. An admin will review it.
      </p>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <Input
          label="Marriage date"
          type="date"
          value={marriageDate}
          onChange={(e) => setMarriageDate(e.target.value)}
          required
        />
        <Input
          label="Registration number (optional)"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          placeholder="As on certificate"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Marriage certificate (PDF/JPG/PNG)
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setCertificate(e.target.files?.[0] || null)}
            className={fileInputClass}
            required
          />
          {certificate && <p className="mt-1 text-xs text-gray-500">{certificate.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Wedding photos (up to 5, optional)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
            className={fileInputClass}
          />
          {photos.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">{photos.length} photo(s) selected</p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          <Upload size={16} /> Submit for review
        </Button>
      </form>
    </DashboardLayout>
  );
}