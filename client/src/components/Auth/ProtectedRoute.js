import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component that controls access to routes based on authentication status and user role
 * 
 * @param {Object} props Component props
 * @param {string[]} props.allowedRoles Array of roles allowed to access this route
 * @param {string} props.redirectPath Path to redirect to if access is denied
 * @returns React component
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login'
}) => {
  const { user, token, loading } = useAuth();
  
  // Show loading state if authentication is being checked
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#4cc9f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            border: '4px solid rgba(76, 201, 240, 0.1)', 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            borderLeft: '4px solid #4cc9f0',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user || !token) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If roles are specified, check if user has allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's dashboard based on role or to login
    if (user.dashboardPath) {
      return <Navigate to={user.dashboardPath} replace />;
    }
    return <Navigate to={redirectPath} replace />;
  }
  
  // If user is unverified, direct them to the verification pending page
  if (!user.isVerified) {
    return <Navigate to="/verification-pending" replace />;
  }
  
  // If authenticated and authorized, render the outlet (child routes)
  return <Outlet />;
};

export default ProtectedRoute;
