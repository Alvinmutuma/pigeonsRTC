import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useMutation } from '@apollo/client'; // No longer used locally
// import { REGISTER_USER } from '../../graphql/mutations/authMutations'; // No longer used locally
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaUserTie, FaCode } from 'react-icons/fa';
import './AuthStyles.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'business_user',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
  });
  
  const { register, loading: authLoading, error: authError } = useAuth();
  // Removed local useMutation for REGISTER_USER as it's handled by AuthContext

  // Effect to update local error message when authError changes
  React.useEffect(() => {
    if (authError) {
      if (authError.includes('already exists')) {
        setErrorMessage('Username or email already exists. Please try different credentials.');
      } else {
        setErrorMessage(authError || 'Registration failed. Please try again.');
      }
    } else {
      setErrorMessage(''); // Clear error when authError is null
    }
  }, [authError]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    // Password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage(
        'Your password must have at least 8 characters and include: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (like @, #, $, %, etc).'
      );
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      // Navigation is handled by AuthContext's handleAuthSuccess after successful registration
    } catch (err) {
      // Error is already set in AuthContext and handled by the useEffect above
      // console.error('Registration submission error in form:', err); // Optional: for local debugging
    }
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4cc9f0" width="64" height="64">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join PigeonRTC to discover and integrate AI agents</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <FaExclamationCircle className="alert-icon" />
            <div className="alert-content">
              <p className="alert-message">{errorMessage}</p>
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Create a password"
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
            
            <div className="password-requirements">
              <small>Password must have at least 8 characters and include:</small>
              <ul>
                <small><li className={/[A-Z]/.test(formData.password) ? 'requirement-met' : ''}>One uppercase letter</li></small>
                <small><li className={/[a-z]/.test(formData.password) ? 'requirement-met' : ''}>One lowercase letter</li></small>
                <small><li className={/[0-9]/.test(formData.password) ? 'requirement-met' : ''}>One number</li></small>
                <small><li className={/[^A-Za-z0-9]/.test(formData.password) ? 'requirement-met' : ''}>One special character</li></small>
              </ul>
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
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
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

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              <div 
                className={`role-option ${formData.role === 'business_user' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'business_user'})}
              >
                <div className="role-option-icon">
                  <FaUserTie />
                </div>
                <div>Business User</div>
              </div>
              <div 
                className={`role-option ${formData.role === 'developer' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'developer'})}
              >
                <div className="role-option-icon">
                  <FaCode />
                </div>
                <div>Developer</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth"
            disabled={authLoading}
          >
            {authLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
