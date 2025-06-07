import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the shared useAuth



const ProtectedRoute = () => {
  const { token, user } = useAuth();
  console.log('ProtectedRoute - token:', token, 'user:', user);

  if (token && !user) {
    // Token exists but user object not yet populated by AuthContext's useEffect.
    // This indicates an initial loading/hydration phase for the user state.
    console.log('ProtectedRoute: Token present, user not yet set. Assuming loading.');
    return null; // Render nothing while AuthContext initializes user
  }

  if (!user) {
    // No user object means not authenticated (either no token, or token was invalid).
    console.log('ProtectedRoute: No user object. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  // User object exists, authenticated.
  console.log('ProtectedRoute: User authenticated. Rendering Outlet.');
  return <Outlet />;
};

export default ProtectedRoute;
