import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaDiscord, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">PigeonRTC</h3>
            <p className="footer-description">
              Connecting businesses with AI agents for the future of automation and efficiency.
            </p>
            <div className="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub className="social-icon" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter className="social-icon" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord className="social-icon" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Product</h4>
              <Link to="/agents">Browse Agents</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/features">Features</Link>
              <Link to="/integrations">Integrations</Link>
            </div>
            <div className="footer-links-column">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/faq">FAQ</Link>
            </div>
            <div className="footer-links-column">
              <h4>Legal</h4>
              <Link to="/legal/privacy-policy">Privacy Policy</Link>
              <Link to="/legal/terms-of-service">Terms of Service</Link>
              <Link to="/legal/security">Security</Link>
              <Link to="/legal/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {currentYear} PigeonRTC. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <Link to="/legal/privacy-policy">Privacy</Link>
            <span className="divider">•</span>
            <Link to="/legal/terms-of-service">Terms</Link>
            <span className="divider">•</span>
            <Link to="/legal/cookie-policy">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
