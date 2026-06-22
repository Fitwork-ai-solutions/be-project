import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { token, user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return <div className="page loading">Loading...</div>;
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'seller' ? '/seller' : '/bidder'} replace />;
  }
  return children;
}
