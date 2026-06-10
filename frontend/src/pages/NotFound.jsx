import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-light px-4 text-center">
      <div>
        <Heart size={40} className="mx-auto mb-4 text-brand" fill="currentColor" />
        <h1 className="text-5xl font-extrabold text-ink">404</h1>
        <p className="mt-2 text-gray-600">This page wandered off.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back home</Button>
        </Link>
      </div>
    </div>
  );
}