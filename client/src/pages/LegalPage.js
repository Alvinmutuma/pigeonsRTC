import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PrivacyPolicyPage from './legal/PrivacyPolicyPage';
import TermsOfServicePage from './legal/TermsOfServicePage';
import SecurityPage from './legal/SecurityPage';
import CookiePolicyPage from './legal/CookiePolicyPage';
import '../styles/LegalPages.css';

const LegalPage = () => {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <div className="container">
          <h1>Legal Information</h1>
          <p>Last Updated: June 3, 2025</p>
        </div>
      </div>
      
      <div className="legal-content container">
        <div className="legal-sidebar">
          <h3>Legal Documents</h3>
          <nav>
            <Link to="/legal/privacy-policy">Privacy Policy</Link>
            <Link to="/legal/terms-of-service">Terms of Service</Link>
            <Link to="/legal/security">Security Policy</Link>
            <Link to="/legal/cookie-policy">Cookie Policy</Link>
          </nav>
        </div>
        
        <div className="legal-main">
          <Routes>
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="cookie-policy" element={<CookiePolicyPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
