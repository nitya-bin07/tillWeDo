import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-3 backdrop-blur">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand">
        <Heart size={20} fill="currentColor" /> TillWeDo
      </Link>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-600 transition hover:text-brand">
              Dashboard
            </Link>
            <span className="hidden text-sm text-gray-400 sm:inline">
              Hi, {user?.name?.split(' ')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 transition hover:text-brand">
              Login
            </Link>
            <Button size="sm" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}