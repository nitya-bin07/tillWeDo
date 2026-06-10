import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { useBreakupTimer } from '../hooks/useBreakupTimer';
import * as coupleApi from '../api/couple';

const pad = (n) => String(n).padStart(2, '0');

export default function BreakupConfirm() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);

  const load = async () => {
    try {
      const res = await coupleApi.getBreakupStatus();
      setInfo(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const timer = useBreakupTimer(info?.initiatedAt);

  const initiate = async () => {
    setWorking(true);
    setError('');
    try {
      await coupleApi.initiateBreakup();
      setConfirmOpen(false);
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.message);
      setConfirmOpen(false);
    } finally {
      setWorking(false);
    }
  };

  const cancel = async () => {
    setWorking(true);
    setError('');
    try {
      await coupleApi.cancelBreakup();
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-red-600">
        <AlertTriangle /> Breakup
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Ending the relationship forfeits the vault per your agreement. This can't be undone after the
        cooling-off period.
      </p>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          {info?.initiated ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-red-600">Breakup in progress</h3>
              <p className="mt-1 text-sm text-gray-600">
                The vault will be forfeited when the cooling-off period ends.
              </p>
              <div className="my-4 rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xs uppercase text-red-400">Time remaining</p>
                {timer.expired ? (
                  <p className="text-xl font-bold text-red-600">Cooling-off ended</p>
                ) : (
                  <p className="font-mono text-3xl font-bold text-red-600">
                    {pad(timer.hours)}:{pad(timer.minutes)}:{pad(timer.seconds)}
                  </p>
                )}
              </div>
              {info.canCancel && (
                <Button variant="secondary" onClick={cancel} loading={working}>
                  <X size={16} /> Cancel breakup
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-red-600">Initiate breakup</h3>
              <p className="mb-4 mt-1 text-sm text-gray-600">
                This starts a cooling-off period. You can cancel during that time. After it ends, the
                vault is forfeited.
              </p>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Initiate breakup
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Initiate breakup?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={working} onClick={initiate}>
              Yes, initiate
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          This begins the cooling-off period. When it ends, your vault funds will be forfeited per
          your agreement. Are you sure?
        </p>
      </Modal>
    </DashboardLayout>
  );
}