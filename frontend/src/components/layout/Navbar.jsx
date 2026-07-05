import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/90 px-6 py-3.5 backdrop-blur">
      <Link to="/" className="flex items-center gap-1 font-display text-lg font-semibold">
        <span className="text-rosewood">Till</span>
        <span className="text-forest">We</span>
        <span className="text-ink">Do</span>
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-ink-soft transition hover:text-rosewood">
              Dashboard
            </Link>
            <span className="hidden font-mono text-sm text-ink-soft/70 sm:inline">
              Hi, {user?.name?.split(' ')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-ink-soft transition hover:text-rosewood">
              Login
            </Link>
            <Button size="sm" onClick={() => navigate('/register')}>
              Get started
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
