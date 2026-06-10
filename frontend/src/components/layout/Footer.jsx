import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
      <p className="flex items-center justify-center gap-1">
        Made with <Heart size={14} className="text-brand" fill="currentColor" /> by TillWeDo
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Save Together. Stay Together. © {new Date().getFullYear()}
      </p>
    </footer>
  );
}