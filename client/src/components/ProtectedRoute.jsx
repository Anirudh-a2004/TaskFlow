import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Loading workspace...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Loading admin controls...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'Admin' ? children : <Navigate to="/" replace />;
}
