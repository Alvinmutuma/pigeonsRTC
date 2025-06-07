// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('authToken') || null,
    user: null,
    loading: true,
    isVerified: false,
    dashboardPath: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp < currentTime) {
          console.log('Token expired, logging out.');
          localStorage.removeItem('authToken');
          setAuthState({ 
            token: null, 
            user: null, 
            loading: false,
            isVerified: false,
            dashboardPath: null
          });
        } else {
          // The backend JWT payload includes id, username, email, role, isVerified, dashboardPath
          setAuthState({ 
            token, 
            user: { 
              id: decodedUser.id, 
              username: decodedUser.username, 
              email: decodedUser.email, 
              role: decodedUser.role 
            },
            loading: false,
            isVerified: decodedUser.isVerified || false,
            dashboardPath: decodedUser.dashboardPath || null
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        setAuthState({ 
          token: null, 
          user: null, 
          loading: false,
          isVerified: false,
          dashboardPath: null
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []); // Runs once on app load

  const login = (authData) => { 
    // Expecting authData to be { token: '...', user: { ... } } from GraphQL response
    if (authData && authData.token && authData.user) {
      localStorage.setItem('authToken', authData.token);
      // Get verification status and dashboard path
      const isVerified = authData.user.isVerified || false;
      const dashboardPath = authData.user.dashboardPath || null;
      
      // The user object from GraphQL (via loginUser/registerUser) is already structured correctly
      setAuthState({ 
        token: authData.token, 
        user: authData.user,
        loading: false,
        isVerified,
        dashboardPath
      });
      
      // Redirect to dashboard if verified
      if (isVerified && dashboardPath) {
        navigate(dashboardPath);
      } else if (!isVerified) {
        navigate('/verification-pending');
      }
    } else {
      console.error('Login function called with invalid authData:', authData);
      // Ensure clean state if login data is bad
      localStorage.removeItem('authToken'); 
      setAuthState({ 
        token: null, 
        user: null,
        loading: false,
        isVerified: false,
        dashboardPath: null
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({ 
      token: null, 
      user: null,
      loading: false,
      isVerified: false,
      dashboardPath: null
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
