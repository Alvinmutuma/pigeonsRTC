import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { FORGOT_PASSWORD } from '../../graphql/mutations/authMutations';
import { FaExclamationCircle, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import './AuthStyles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: () => {
      setStatus('success');
    },
    onError: (error) => {
      console.error('Forgot password error:', error);
      setStatus('error');
      setErrorMessage('An error occurred. Please try again later.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    forgotPassword({
      variables: { email },
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FaEnvelope style={{ fontSize: '3rem', color: '#4cc9f0' }} />
          </div>
          <h1 className="auth-title">Reset Your Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {status === 'error' && (
          <div className="alert alert-error">
            <FaExclamationCircle className="alert-icon" />
            <div className="alert-content">
              <p className="alert-message">{errorMessage}</p>
            </div>
          </div>
        )}

        {status === 'success' ? (
          <div>
            <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
              <FaCheckCircle className="alert-icon" />
              <div className="alert-content">
                <p className="alert-message">
                  If an account with that email exists, we've sent password reset instructions to {email}.
                </p>
              </div>
            </div>
            <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/login" className="btn-auth">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth"
              disabled={loading || status === 'loading'}
            >
              {loading || status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
