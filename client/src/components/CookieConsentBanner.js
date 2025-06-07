import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsentBanner.css';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    // Set only essential cookies
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-content">
        <h4>Cookie Consent</h4>
        <p>
          PigeonRTC uses cookies to enhance your experience. By continuing to use our site, you agree to our{' '}
          <Link to="/legal/cookie-policy" className="cookie-link">
            Cookie Policy
          </Link>.
        </p>
        <div className="cookie-buttons">
          <button 
            className="cookie-button cookie-button-settings"
            onClick={() => window.location.href = '/legal/cookie-policy'}
          >
            Manage Settings
          </button>
          <button 
            className="cookie-button cookie-button-decline"
            onClick={handleDecline}
          >
            Decline
          </button>
          <button 
            className="cookie-button cookie-button-accept"
            onClick={handleAccept}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
