import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { ROUTES } from '../../shared/constants/routes.js';
import { showToast } from '../../shared/utils/toast.js';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading, checkAuth } = useAuth();
  const authCheckedRef = useRef(false);

  // Normalize allowedRoles to lowercase trimmed strings
  const normalizedAllowedRoles = useMemo(() => {
    if (
      !allowedRoles ||
      !Array.isArray(allowedRoles) ||
      allowedRoles.length === 0
    ) {
      return null;
    }
    return allowedRoles.map((r) => String(r).toLowerCase().trim());
  }, [allowedRoles]);

  const userRole = (user?.role || '').toLowerCase().trim();
  const isRoleRestricted = Boolean(
    normalizedAllowedRoles && normalizedAllowedRoles.length > 0
  );
  const isAdminRequired = Boolean(
    normalizedAllowedRoles && normalizedAllowedRoles.includes('admin')
  );

  // If role is restricted, require background auth check if role is admin or if role is currently unverified
  const initialRoleValid = isRoleRestricted
    ? isAdminRequired
      ? userRole === 'admin'
        ? true
        : null
      : normalizedAllowedRoles.includes(userRole)
    : true;

  const [isRoleValid, setIsRoleValid] = useState(initialRoleValid);

  useEffect(() => {
    let isMounted = true;

    if (
      isAuthenticated &&
      isRoleRestricted &&
      isRoleValid === null &&
      !authCheckedRef.current
    ) {
      authCheckedRef.current = true;
      checkAuth()
        .then((freshUser) => {
          if (!isMounted) return;
          const freshRole = (freshUser?.role || userRole).toLowerCase().trim();
          if (normalizedAllowedRoles.includes(freshRole)) {
            setIsRoleValid(true);
          } else {
            setIsRoleValid(false);
            showToast.error('Access denied. Insufficient permissions.');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          if (normalizedAllowedRoles.includes(userRole)) {
            setIsRoleValid(true);
          } else {
            setIsRoleValid(false);
            showToast.error('Access denied. Insufficient permissions.');
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    isRoleRestricted,
    isRoleValid,
    normalizedAllowedRoles,
    userRole,
    checkAuth,
  ]);

  if (
    loading ||
    (isRoleRestricted && isRoleValid === null && isAuthenticated)
  ) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (isRoleRestricted) {
    if (isRoleValid === false || !normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
