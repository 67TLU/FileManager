import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LoadingSpinner } from './loading-spinner';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // TODO: Check role khi cần
  if (requiredRole && user) {
    // Implement role check here
  }

  return <Outlet />;
}