// src/auth/RoleProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import NoAccessPage from './NoAccessPage';
import { Outlet } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <NoAccessPage />;
  }

  console.log('allowedRoles:', allowedRoles, typeof allowedRoles);
  console.log('user.role:', user.role);
  console.log('includes?', allowedRoles.includes(user.role));

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "Resource Manager") return <Navigate to="/manage-coding-bank" replace />;
    if (user.role === "Content Moderator") return <Navigate to="/content-moderator" replace />;
    if (user.role === "Admin") return <Navigate to="/admin" replace />;
    return <NoAccessPage />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;