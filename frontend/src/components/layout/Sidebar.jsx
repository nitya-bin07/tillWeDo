import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  History,
  Users,
  Heart,
  User,
  Shield,
  FileCheck,
  Database,
  User,
  HeartCrack,
  Shield,
  FileCheck,
  Database,
} from 'lucide-react';



import { useAuth } from '../../hooks/useAuth';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
    isActive ? 'bg-brand-light font-medium text-brand-dark' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-gray-100 bg-white p-3 md:flex">
      <NavLink to="/dashboard" className={linkClass}>
        <LayoutDashboard size={18} /> Dashboard
      </NavLink>
      <NavLink to="/vault/setup" className={linkClass}>
        <Wallet size={18} /> Vault
      </NavLink>
      <NavLink to="/vault/history" className={linkClass}>
        <History size={18} /> History
      </NavLink>
      <NavLink to="/couple/invite" className={linkClass}>
        <Users size={18} /> Partner
      </NavLink>
      <NavLink to="/marriage/status" className={linkClass}>
        <Heart size={18} /> Marriage
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User size={18} /> Profile
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User size={18} /> Profile
      </NavLink>
      <NavLink
        to="/breakup/confirm"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            isActive ? 'bg-red-50 font-medium text-red-600' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          }`
        }
      >
        <HeartCrack size={18} /> Breakup
      </NavLink>

      {isAdmin && (
        <>
          <div className="mb-1 mt-3 px-3 text-xs font-semibold uppercase text-gray-400">Admin</div>
          <NavLink to="/admin" end className={linkClass}>
            <Shield size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/proofs" className={linkClass}>
            <FileCheck size={18} /> Proofs
          </NavLink>
          <NavLink to="/admin/vaults" className={linkClass}>
            <Database size={18} /> Vaults
          </NavLink>
        </>
      )}
    </aside>
  );
}