import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths = {
      admin: '/admin',
      distributor: '/distributor',
      wholesaler: '/wholesaler',
      cco: '/cco',
      marketer: '/marketer',
      sales: '/sales',
      retail: '/shop'
    };
    
    return <Navigate to={dashboardPaths[role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
