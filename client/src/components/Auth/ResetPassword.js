import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../../graphql/mutations/authMutations';
import { FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash, FaLockOpen } from 'react-icons/fa';
import './AuthStyles.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
  });

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      setStatus('success');
    },
    onError: (error) => {
      console.error('Reset password error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Error resetting password. The link may be invalid or expired.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Check password strength on password change
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    // Simple password strength checker
    let score = 0;
    let label = '';
    
    // Empty password
    if (!password) {
      setPasswordStrength({ score: 0, label: '' });
      return;
    }
    
    // Length check
    if (password.length >= 8) score += 1;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    
    // Number check
    if (/[0-9]/.test(password)) score += 1;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine label
    if (score === 0 || score === 1) {
      label = 'Weak';
    } else if (score === 2) {
      label = 'Fair';
    } else if (score === 3 || score === 4) {
      label = 'Good';
    } else {
      label = 'Strong';
    }
    
    setPasswordStrength({ score, label });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    // Password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      );
      return;
    }
    
    resetPassword({
      variables: {
        token,
        newPassword: formData.password,
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const getPasswordStrengthClass = () => {
    switch (passwordStrength.label) {
      case 'Weak':
        return 'strength-weak';
      case 'Fair':
        return 'strength-fair';
      case 'Good':
        return 'strength-good';
      case 'Strong':
        return 'strength-strong';
      default:
        return '';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FaLockOpen style={{ fontSize: '3rem', color: '#4cc9f0' }} />
          </div>
          <h1 className="auth-title">Reset Your Password</h1>
          <p className="auth-subtitle">
            Enter a new password for your account
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
                  Your password has been successfully reset!
                </p>
              </div>
            </div>
            <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/login" className="btn-auth">
                Sign in with New Password
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {formData.password && (
                <>
                  <div className="password-strength">
                    <div className={`password-strength-bar ${getPasswordStrengthClass()}`}></div>
                  </div>
                  <div className="password-strength-text" style={{ color: passwordStrength.label === 'Strong' ? '#38a169' : '#e2e8f0' }}>
                    {passwordStrength.label}
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {errorMessage && !status && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-auth"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <div className="auth-footer">
            <p>
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

export default ResetPassword;
