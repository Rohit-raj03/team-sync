import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { ROUTES } from '../../shared/constants/routes.js';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || '').toLowerCase().trim();
    const hasRole = allowedRoles.some((r) => r.toLowerCase().trim() === userRole);
    if (!hasRole) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
