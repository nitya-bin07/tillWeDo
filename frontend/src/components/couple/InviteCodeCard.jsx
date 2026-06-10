import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import Button from '../common/Button';

export default function InviteCodeCard({ code }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/couple/join/${code}`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join me on TillWeDo', text: `My invite code: ${code}`, url: joinUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      copy(joinUrl);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">Your invite code</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="rounded-lg bg-brand-light px-4 py-2 font-mono text-2xl font-bold tracking-widest text-brand-dark">
          {code}
        </span>
        <button onClick={() => copy(code)} className="text-gray-400 transition hover:text-brand" title="Copy code">
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500">Or share the join link:</p>
      <div className="mt-1 flex items-center gap-2">
        <input
          readOnly
          value={joinUrl}
          className="w-full truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
        />
        <Button variant="secondary" size="sm" onClick={share}>
          <Share2 size={16} /> Share
        </Button>
      </div>
    </div>
  );
}