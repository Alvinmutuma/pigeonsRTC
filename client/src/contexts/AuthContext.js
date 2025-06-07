import { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ME } from '../graphql/queries';
import { LOGIN_USER, REGISTER_USER } from '../graphql/mutations';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  // Initialize loading to true only if a token exists, indicating an auth check might be pending.
  // If no token, we are not 'loading' an existing session.
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const client = useApolloClient();

  // Function to handle user authentication state
  // Centralized navigation logic based on authentication and verification status
  const navigateBasedOnAuth = useCallback((userData, currentPathname) => {
    if (!userData || typeof userData.isVerified === 'undefined') {
      console.warn('[AuthContext] navigateBasedOnAuth: Invalid userData or isVerified missing. Current user state:', user, 'Incoming userData:', userData);
      // If critical data is missing, and not on a public auth page, consider redirecting to login.
      // However, this might be too aggressive if called from GET_ME where user might just be null.
      // For now, let's ensure it doesn't crash and relies on page/route guards for no-user scenarios.
      if (currentPathname !== '/login' && currentPathname !== '/register') {
        // Avoid redirect loops if already on login/register
        // navigate('/login', { replace: true });
      }
      return;
    }

    if (!userData.isVerified && !(userData.email && userData.email.includes('example.com'))) {
      console.log('[AuthContext] navigateBasedOnAuth: User not verified. User:', userData, 'Current Path:', currentPathname);
      if (currentPathname !== '/verification-pending') {
        navigate('/verification-pending', { replace: true });
      }
    } else {
      // User is verified or an example.com user
      const targetDashboardPath = {
        'admin': '/admin/dashboard',
        'developer': '/developer-dashboard',
        'business_user': '/business-dashboard'
      }[userData.role] || '/'; // Default to home or a generic dashboard

      console.log('[AuthContext] navigateBasedOnAuth: User verified or example. Role:', userData.role, 'Target:', targetDashboardPath, 'User:', userData, 'Current Path:', currentPathname);
      
      if (['/login', '/register', '/verification-pending'].includes(currentPathname)) {
        navigate(targetDashboardPath, { replace: true });
      } else {
        // User is verified and not on an initial auth/pending page.
        // Generally, don't force redirect if they are on other valid pages.
        // Page-specific guards (ProtectedRoutes) should handle if they are on a page they shouldn't be.
        console.log('[AuthContext] User is verified. Currently on:', currentPathname, '. No forced redirect to dashboard unless from auth/pending page.');
      }
    }
  }, [navigate, user]); // Added user to dependencies as it's referenced in console.warn

  const handleAuthSuccess = useCallback((authData) => {
    if (!authData || !authData.token || !authData.user) {
      console.error('Login failed: Invalid authentication data received from server.', authData);
      setUser(null); // Clear user state
      setToken('');  // Clear token state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setError('Login failed: Invalid authentication data from server.'); // Provide feedback
      navigate('/login', { replace: true }); // Redirect to login
      return; // Exit early
    }
    
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    setToken(authData.token);
    setUser(authData.user);
    setError(null);

    // Ensure the user object has isVerified for the check below
    // Ensure the user object has isVerified, defaulting if necessary.
    // This should ideally always come correctly from the server.
    if (authData.user && typeof authData.user.isVerified === 'undefined') {
        console.warn('[AuthContext] handleAuthSuccess: User object from authData is missing isVerified. Defaulting to false.');
        authData.user.isVerified = false; 
    }

    // Perform navigation based on the new auth state
    navigateBasedOnAuth(authData.user, window.location.pathname);
  }, [navigate, navigateBasedOnAuth]); // Removed setError, setToken, setUser from deps as they are stable setters or part of AuthProvider scope

  // Check if user is authenticated on initial load
  const { loading: userLoading, refetch: refetchUser } = useQuery(GET_ME, {
    skip: !token,
    onCompleted: (data) => {
      setLoading(false); // Set loading false first
      if (data?.me) {
        console.log('[AuthContext] GET_ME completed. User data received:', data.me);
        setUser(data.me); // Update user state
        localStorage.setItem('user', JSON.stringify(data.me)); // Update localStorage
        // After user state is updated from GET_ME, evaluate redirection
        navigateBasedOnAuth(data.me, window.location.pathname);
      } else {
        // No user data from GET_ME, implies token might be invalid or session expired
        console.log('[AuthContext] GET_ME completed. No user data (data.me is null/undefined). Clearing local session.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(''); // Clear token state
        setUser(null);  // Clear user state
        // Rely on ProtectedRoute or page-level effects to redirect to /login if necessary
        // Or, if not on a public page already, navigate to login:
        const publicAuthPaths = ['/login', '/register', '/verify-email', '/verification-pending', '/forgot-password', '/reset-password'];
        if (!publicAuthPaths.some(path => window.location.pathname.startsWith(path))) {
            console.log('[AuthContext] GET_ME no user, redirecting to login from non-auth page:', window.location.pathname);
            navigate('/login', { replace: true });
        }
      }
    },
    onError: (error) => {
      console.error('[AuthContext] GET_ME error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken('');
      setUser(null);
      setLoading(false);
      // Rely on ProtectedRoute or page-level effects to redirect to /login if necessary
      const publicAuthPaths = ['/login', '/register', '/verify-email', '/verification-pending', '/forgot-password', '/reset-password'];
      if (!publicAuthPaths.some(path => window.location.pathname.startsWith(path))) {
        console.log('[AuthContext] GET_ME error, redirecting to login from non-auth page:', window.location.pathname);
        navigate('/login', { replace: true });
      }
    }
  });

  // Login mutation with better error handling
  const [loginMutation] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      handleAuthSuccess(data?.loginUser);
    },
    onError: (error) => {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken('');
      setUser(null);
      setError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  // Register mutation with better error handling
  const [registerMutation] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      handleAuthSuccess(data?.registerUser);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    },
  });

  // Wrapper functions with error handling
  const login = async (credentials) => {
    try {
      setError(null);
      // Explicitly pass email and password as separate variables
      return await loginMutation({
        variables: {
          email: credentials.email,
          password: credentials.password
        }
      });
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      return await registerMutation({ variables: { input: userData } });
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setError(null);
    
    // Clear Apollo cache
    client.clearStore();
    
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [client, navigate]);

  const value = {
    user,
    token,
    loading: loading || userLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };

export default AuthContext;
