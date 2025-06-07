import React from 'react';
import { Link } from 'react-router-dom';
import './LegalNotice.css';

/**
 * LegalNotice component displays important legal links and information
 * for use in community forum and other user-generated content areas
 */
const LegalNotice = ({ variant = 'default' }) => {
  // Different variants for different contexts (sidebar, footer, inline)
  const isCompact = variant === 'compact';
  const isSidebar = variant === 'sidebar';
  
  return (
    <div className={`legal-notice ${variant}`}>
      {!isCompact && <h4 className="legal-notice-title">Community Guidelines</h4>}
      
      <p className="legal-notice-text">
        {isCompact ? 'By posting, you agree to our ' : 
          'Participation in the PigeonRTC community is subject to our '}
        <Link to="/legal/terms-of-service" className="legal-link">Terms of Service</Link>
        {!isCompact && ' and '}
        {isCompact && ' & '}
        <Link to="/legal/privacy-policy" className="legal-link">Privacy Policy</Link>.
      </p>
      
      {isSidebar && (
        <div className="legal-links-grid">
          <Link to="/legal/terms-of-service" className="sidebar-legal-link">
            Terms of Service
          </Link>
          <Link to="/legal/privacy-policy" className="sidebar-legal-link">
            Privacy Policy
          </Link>
          <Link to="/legal/security" className="sidebar-legal-link">
            Security
          </Link>
          <Link to="/legal/cookie-policy" className="sidebar-legal-link">
            Cookie Policy
          </Link>
        </div>
      )}
      
      {!isCompact && (
        <p className="legal-disclaimer">
          PigeonRTC reserves the right to remove content that violates our policies.
          Report inappropriate content by clicking the "..." menu on any post.
        </p>
      )}
    </div>
  );
};

export default LegalNotice;
