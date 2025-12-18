// src/auth/RoleProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import NoAccessPage from './NoAccessPage'; 

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useUserProfile();

  // 1. Show loading ONLY during the initial app load (refresh), not every page switch
  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Verifying access...</p>
      </div>
    );
  }

  // 2. Not logged in -> Redirect to login (or NoAccessPage/Landing)
  if (!user) {
    // Redirecting to Landing Page or Login is usually better UX than NoAccessPage for unauthenticated users
    return <Navigate to="/" replace />; 
  }

  // 3. Logged in but wrong role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`Access denied. Role: ${user.role}, Required: ${allowedRoles}`);
    
    // Optional: Redirect to their specific dashboard instead of a generic error page
    if (user.role === "Resource Manager") return <Navigate to="/manage-coding-bank" replace />;
    if (user.role === "Content Moderator") return <Navigate to="/content-moderator" replace />;
    if (user.role === "Admin") return <Navigate to="/admin" replace />;
    
    return <NoAccessPage />;
  }

  // 4. Authorized
  return <Outlet />;
};

export default RoleProtectedRoute;