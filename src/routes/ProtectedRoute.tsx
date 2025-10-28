import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import type { Role } from '../constants/roles';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('PROTECTED ROUTE CHECK:', { isAuthenticated, user, allowedRoles });

  if (!isAuthenticated) {
    console.log('REASON: Not authenticated. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.role)) {
    console.log('REASON: Success. Access granted.');
    return <Outlet />;
  }

  console.log('REASON: Wrong role. Redirecting to /unauthorized');
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;