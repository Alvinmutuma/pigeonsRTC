import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import '../styles/LegalPages.css';

const LegalLayout = ({ title, description, children }) => {
  return (
    <div className="legal-container">
      <SEO 
        title={`${title} | PigeonRTC`}
        description={description}
        path={`/legal/${title.toLowerCase().replace(/\s+/g, '-')}`}
      />
      <div className="legal-header">
        <div className="container">
          <h1>{title}</h1>
          <p className="last-updated">Last Updated: June 3, 2025</p>
        </div>
      </div>
      
      <div className="legal-content container">
        <div className="legal-sidebar">
          <h3>Legal Documents</h3>
          <nav>
            <Link to="/legal/privacy-policy" className="legal-nav-link">Privacy Policy</Link>
            <Link to="/legal/terms-of-service" className="legal-nav-link">Terms of Service</Link>
            <Link to="/legal/security" className="legal-nav-link">Security</Link>
            <Link to="/legal/cookie-policy" className="legal-nav-link">Cookie Policy</Link>
          </nav>
        </div>
        
        <div className="legal-main">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
