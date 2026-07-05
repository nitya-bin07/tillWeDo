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
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/95 px-8 py-4 backdrop-blur">
      <Link to="/" className="font-display text-lg italic text-ink">
        TillWeDo<span className="text-accent">.</span>
      </Link>

      <div className="flex items-center gap-5">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-ink-soft transition hover:text-ink">
              Dashboard
            </Link>
            <span className="hidden font-mono text-xs text-ink-faint sm:inline">
              {user?.name?.split(' ')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-ink-soft transition hover:text-ink">
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
