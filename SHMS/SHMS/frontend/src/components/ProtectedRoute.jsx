import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Checking Authorization...</div>;
  }

  // 1. Instantly drop unauthenticated traffic mapping out of standard layouts
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Hard block structural execution if the JWT doesn't encode matching parameters explicitly
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
