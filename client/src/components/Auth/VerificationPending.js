import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RESEND_VERIFICATION_EMAIL } from '../../graphql/mutations/authMutations';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import './AuthStyles.css';

const VerificationPending = () => {
  const { user } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const [resendVerificationEmailMutation] = useMutation(RESEND_VERIFICATION_EMAIL, {
    onCompleted: (data) => {
      setResendLoading(false);
      setResendMessage(data.resendVerificationEmail.message || 'Verification email has been resent. Please check your inbox.');
      setResendError('');
    },
    onError: (error) => {
      setResendLoading(false);
      setResendMessage('');
      setResendError(error.message || 'Failed to resend verification email. Please try again.');
    }
  });

  const handleResendVerification = async () => {
    if (!user || !user.email) {
      setResendError('Could not find user email. Please try logging in again.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    setResendError('');
    try {
      await resendVerificationEmailMutation({ variables: { email: user.email } });
    } catch (e) {
      // Error is handled by onError callback
      console.error('Resend verification error:', e);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ fontSize: '3rem', color: '#4cc9f0' }}>
            <FaEnvelope />
          </div>
          <h1 className="auth-title">Check Your Email</h1>
          <p className="auth-subtitle">We've sent you a verification link</p>
        </div>

                {resendMessage && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <p>{resendMessage}</p>
          </div>
        )}
        {resendError && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            <p>{resendError}</p>
          </div>
        )}

        <div className="alert alert-info">
          <div className="alert-content">
            <p className="alert-message">
              Please check your email inbox and click the verification link to complete your registration. 
              The link will expire in 24 hours.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem' }}>Didn't receive an email?</h3>
          <ul style={{ color: '#e2e8f0', fontSize: '0.95rem', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Check your spam or junk folder</li>
            <li style={{ marginBottom: '0.5rem' }}>Make sure you entered your email correctly</li>
            <li>Wait a few minutes and refresh your inbox</li>
          </ul>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              className="btn-auth-outline" 
              style={{ margin: '0 auto' }} 
              onClick={handleResendVerification} 
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Need help?{' '}
            <Link to="/support" className="auth-link">
              Contact Support
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
        <p>
          <FaExclamationTriangle style={{ marginRight: '0.5rem', fontSize: '0.9rem' }} />
          For security reasons, you must verify your email before you can access your account.
        </p>
      </div>
    </div>
  );
};

export default VerificationPending;
