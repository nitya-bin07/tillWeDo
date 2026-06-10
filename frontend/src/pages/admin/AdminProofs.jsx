import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/format';
import * as adminApi from '../../api/admin';

export default function AdminProofs() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMarriageProofs();
      setProofs(res.data.proofs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setWorking(id);
    setError('');
    try {
      await adminApi.approveProof(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  const doReject = async () => {
    if (!rejectFor) return;
    setWorking(rejectFor._id);
    setError('');
    try {
      await adminApi.rejectProof(rejectFor._id, { rejectionReason: reason });
      setRejectFor(null);
      setReason('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-ink">Marriage proofs</h1>
      <p className="mb-6 text-sm text-gray-500">
        Review submissions. Approving triggers the vault payout.
      </p>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      {loading ? (
        <Loader />
      ) : proofs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No pending proofs. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {proofs.map((p) => (
            <div key={p._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">{p.submittedBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{p.submittedBy?.email}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Marriage date: {formatDate(p.marriageDate)} · Reg #: {p.registrationNumber || '—'}
                  </p>
                </div>
                <Badge status={p.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {p.marriageCertificateUrl && (
                  <a
                    href={p.marriageCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-brand underline"
                  >
                    Certificate
                  </a>
                )}
                {p.weddingPhotoUrls?.map((u, i) => (
                  <img key={i} src={u} alt="" className="h-14 w-14 rounded-lg object-cover" />
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" loading={working === p._id} onClick={() => approve(p._id)}>
                  Approve & pay out
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={working === p._id}
                  onClick={() => {
                    setRejectFor(p);
                    setReason('');
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(rejectFor)}
        onClose={() => setRejectFor(null)}
        title="Reject proof"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectFor(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={Boolean(working)}
              disabled={reason.trim().length < 3}
              onClick={doReject}
            >
              Reject
            </Button>
          </div>
        }
      >
        <Input
          label="Reason for rejection"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Certificate is unclear"
        />
      </Modal>
    </DashboardLayout>
  );
}