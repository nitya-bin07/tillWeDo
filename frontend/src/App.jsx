import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import InvitePartner from './pages/InvitePartner';
import JoinCouple from './pages/JoinCouple';
import VaultSetup from './pages/VaultSetup';
import VaultHistory from './pages/VaultHistory';
import Profile from './pages/Profile';
import MarriageSubmit from './pages/MarriageSubmit';
import MarriageStatus from './pages/MarriageStatus';
import BreakupConfirm from './pages/BreakupConfirm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProofs from './pages/admin/AdminProofs';
import AdminVaults from './pages/admin/AdminVaults';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/couple/join" element={<JoinCouple />} />
      <Route path="/couple/join/:code" element={<JoinCouple />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/vault/setup" element={<ProtectedRoute><VaultSetup /></ProtectedRoute>} />
      <Route path="/vault/history" element={<ProtectedRoute><VaultHistory /></ProtectedRoute>} />
      <Route path="/couple/invite" element={<ProtectedRoute><InvitePartner /></ProtectedRoute>} />
      <Route path="/marriage/submit" element={<ProtectedRoute><MarriageSubmit /></ProtectedRoute>} />
      <Route path="/marriage/status" element={<ProtectedRoute><MarriageStatus /></ProtectedRoute>} />
      <Route path="/breakup/confirm" element={<ProtectedRoute><BreakupConfirm /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/proofs" element={<ProtectedRoute adminOnly><AdminProofs /></ProtectedRoute>} />
      <Route path="/admin/vaults" element={<ProtectedRoute adminOnly><AdminVaults /></ProtectedRoute>} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}