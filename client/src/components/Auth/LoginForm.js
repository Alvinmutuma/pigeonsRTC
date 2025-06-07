import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RESEND_VERIFICATION_EMAIL } from '../../graphql/mutations/authMutations';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthStyles.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [resendStatus, setResendStatus] = useState({ success: false, message: '' });
  const { login } = useAuth();
  const location = useLocation();

  const [resendVerificationEmail] = useMutation(RESEND_VERIFICATION_EMAIL);
  
  // Check for auth loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setShowResendLink(false);
    setIsSubmitting(true);

    // Basic validation
    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.password) {
      setErrorMessage('Password is required');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting login with:', { 
        email: formData.email.trim(), 
        // Don't log the actual password
        password: formData.password ? '[HIDDEN]' : 'undefined' 
      });
      
      // Call the login function from AuthContext which will handle the mutation
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (error) {
      console.error('Login submission error:', error);
      // Error is already handled in the mutation's onError callback
      // Just make sure to reset the loading state if needed
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="auth-header" variants={itemVariants}>
          <div className="auth-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your PigeonRTC account to continue</p>
        </motion.div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              className="alert alert-error"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaExclamationCircle className="alert-icon" />
              <div className="alert-content">
                <p className="alert-message">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="auth-form" onSubmit={handleSubmit}>
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errorMessage && errorMessage.toLowerCase().includes('email') ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <div className="form-label-wrapper">
              <label htmlFor="password" className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${errorMessage && errorMessage.toLowerCase().includes('password') ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={`password-toggle ${showPassword ? 'active' : ''}`}
                onClick={togglePasswordVisibility}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              className="btn-auth"
              disabled={isSubmitting || !formData.email || !formData.password}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="icon-right" />
                </>
              )}
            </button>

            {showResendLink && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive a verification email?
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setResendStatus({ success: false, message: 'Sending...' });
                      await resendVerificationEmail({ variables: { email: formData.email } });
                      setResendStatus({ 
                        success: true, 
                        message: 'Verification email sent! Please check your inbox.' 
                      });
                    } catch (err) {
                      console.error('Error resending verification email:', err);
                      setResendStatus({ 
                        success: false, 
                        message: 'Failed to resend verification email. Please try again.' 
                      });
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                  disabled={resendStatus.message === 'Sending...'}
                >
                  {resendStatus.message || 'Resend Verification Email'}
                </button>
                {resendStatus.message && (
                  <p className={`mt-2 text-sm ${resendStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                    {resendStatus.message}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </form>

        <motion.div className="auth-footer" variants={itemVariants}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" state={{ from: location.state?.from }}>
              Create an account
            </Link>
          </p>
          

        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
