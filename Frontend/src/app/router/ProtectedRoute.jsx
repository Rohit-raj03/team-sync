import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { ROUTES } from '../../shared/constants/routes.js';
import { showToast } from '../../shared/utils/toast.js';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading, checkAuth } = useAuth();

  const userRole = (user?.role || '').toLowerCase().trim();
  const isAdminRequired = Boolean(
    allowedRoles &&
    allowedRoles.some((r) => r.toLowerCase().trim() === 'admin')
  );

  const initialAdminValid = isAdminRequired ? (userRole === 'admin' ? true : null) : true;
  const [isRoleValid, setIsRoleValid] = useState(initialAdminValid);
  const authCheckedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Background verify admin role if required and not verified yet
    if (isAuthenticated && isAdminRequired && isRoleValid === null && !authCheckedRef.current) {
      authCheckedRef.current = true;
      checkAuth()
        .then((freshUser) => {
          if (!isMounted) return;
          const freshRole = (freshUser?.role || userRole).toLowerCase().trim();
          if (freshRole === 'admin') {
            setIsRoleValid(true);
          } else {
            setIsRoleValid(false);
            showToast.error('Access denied. Administrator privileges required.');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          // If offline or fetch failed, fall back to existing user role in Redux
          if (userRole === 'admin') {
            setIsRoleValid(true);
          } else {
            setIsRoleValid(false);
            showToast.error('Access denied. Administrator privileges required.');
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdminRequired, isRoleValid, userRole, checkAuth]);

  if (loading || (isAdminRequired && isRoleValid === null && isAuthenticated)) {
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
    if (isAdminRequired && isRoleValid === false) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    const hasRole = allowedRoles.some((r) => r.toLowerCase().trim() === userRole);
    if (!hasRole && isRoleValid !== true) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
