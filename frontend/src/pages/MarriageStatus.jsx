import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileCheck } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/format';
import * as marriageApi from '../api/marriage';

export default function MarriageStatus() {
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    marriageApi
      .getStatus()
      .then((res) => { if (active) setProof(res.data.proof); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-ink">
        <Heart className="text-brand" fill="currentColor" /> Marriage status
      </h1>
      <p className="mb-6 text-sm text-gray-500">Track your proof review and vault payout.</p>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      ) : !proof ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <FileCheck size={32} className="mx-auto mb-3 text-brand" />
          <p className="mb-4 text-gray-600">No marriage proof submitted yet.</p>
          <Link to="/marriage/submit"><Button>Submit proof</Button></Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">Proof review</h3>
              <Badge status={proof.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><p className="text-gray-500">Marriage date</p><p className="font-medium text-ink">{formatDate(proof.marriageDate)}</p></div>
              <div><p className="text-gray-500">Registration #</p><p className="font-medium text-ink">{proof.registrationNumber || '-'}</p></div>
              <div><p className="text-gray-500">Submitted</p><p className="font-medium text-ink">{formatDate(proof.submittedAt)}</p></div>
            </div>
            {proof.status === 'rejected' && proof.rejectionReason && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Rejected: {proof.rejectionReason}</div>
            )}
            {proof.status === 'approved' && (
              <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Approved! Your vault payout has been processed.</div>
            )}
            {(proof.status === 'pending' || proof.status === 'under_review') && (
              <div className="mt-4 rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">Your proof is being reviewed.</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-ink">Uploaded documents</h3>
            {proof.marriageCertificateUrl ? (
              <a href={proof.marriageCertificateUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand underline">View certificate</a>
            ) : (
              <p className="text-sm text-gray-500">No certificate on file.</p>
            )}
            {proof.weddingPhotoUrls?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {proof.weddingPhotoUrls.map((u, i) => (<img key={i} src={u} alt="" className="h-20 w-20 rounded-lg object-cover" />))}
              </div>
            )}
          </div>

          {proof.status === 'rejected' && (<Link to="/marriage/submit"><Button>Resubmit proof</Button></Link>)}
        </div>
      )}
    </DashboardLayout>
  );
}
