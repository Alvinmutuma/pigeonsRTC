import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL } from '../../graphql/mutations/authMutations';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './AuthStyles.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();

  const [verifyEmail] = useMutation(VERIFY_EMAIL, {
    onCompleted: (data) => {
      // Successful verification
      setVerificationStatus('success');
      
      // Auto login user after 2 seconds
      setTimeout(() => {
        login(data.verifyEmail);
        // Redirect will happen automatically based on dashboardPath in the AuthContext
      }, 2000);
    },
    onError: (error) => {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Verification failed. The link may be invalid or expired.');
    },
  });

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification token.');
      return;
    }

    // Verify email when component mounts
    verifyEmail({
      variables: { token },
    });
  }, [token, verifyEmail]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <>
            <div className="auth-logo" style={{ fontSize: '3rem', color: '#4cc9f0', display: 'flex', justifyContent: 'center' }}>
              <FaSpinner className="fa-spin" style={{ animation: 'fa-spin 2s infinite linear' }} />
            </div>
            <h1 className="auth-title">Verifying Your Email</h1>
            <p className="auth-subtitle">Please wait while we verify your email address...</p>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="auth-logo" style={{ fontSize: '3rem', color: '#38a169', display: 'flex', justifyContent: 'center' }}>
              <FaCheckCircle />
            </div>
            <h1 className="auth-title">Email Verified!</h1>
            <p className="auth-subtitle">Your email has been successfully verified. You'll be redirected to your dashboard momentarily.</p>
            <div className="auth-footer">
              <p>
                Not being redirected?{' '}
                <Link to="/login" className="auth-link">
                  Sign in manually
                </Link>
              </p>
            </div>
          </>
        );
        
      case 'error':
        return (
          <>
            <div className="auth-logo" style={{ fontSize: '3rem', color: '#e53e3e', display: 'flex', justifyContent: 'center' }}>
              <FaTimesCircle />
            </div>
            <h1 className="auth-title">Verification Failed</h1>
            <p className="auth-subtitle">{errorMessage}</p>
            <div className="auth-footer" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>
                <Link to="/resend-verification" className="auth-link">
                  Request a new verification link
                </Link>
              </p>
              <p>
                <Link to="/login" className="auth-link">
                  Return to login
                </Link>
              </p>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
