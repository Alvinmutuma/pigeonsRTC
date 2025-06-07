import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useMutation } from '@apollo/client';
import { SEND_INTEREST_EMAIL } from '../graphql/mutations';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    interest: 'pricing' // Default interest category
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [sendInterestEmail, { loading }] = useMutation(SEND_INTEREST_EMAIL);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await sendInterestEmail({
        variables: {
          input: {
            ...formData
          }
        }
      });

      if (data.sendInterestEmail.success) {
        setSuccessMessage('Thank you for your interest! We will contact you soon.');
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          interest: 'pricing'
        });
        setErrorMessage('');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error sending interest email:', error);
      setErrorMessage(error.message || 'An error occurred. Please try again later.');
    }
  };

  return (
    <> {/* Changed to shorthand fragment */}
      <SEO
        title="Contact Us - PigeonRTC | Get in Touch"
        description="Contact PigeonRTC for inquiries about our AI agent marketplace, partnerships, or support. We're here to help you integrate intelligent automation."
        keywords="contact PigeonRTC, AI support, AI marketplace inquiry, business automation help, PigeonRTC support"
        url="https://pigeonrtc.com/contact"
        image="https://pigeonrtc.com/images/og-contact.png" // Replace with actual path to a contact-specific OG image
      />
      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p>Interested in PigeonRTC? Let us know how we can help.</p>
          </div>

          {successMessage && (
            <div className="success-message">
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"/>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Your email address"/>
            </div>
            <div className="form-group">
              <label htmlFor="company">Company (Optional)</label>
              <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Your company name"/>
            </div>
            <div className="form-group">
              <label htmlFor="interest">I'm interested in</label>
              <select id="interest" name="interest" value={formData.interest} onChange={handleChange} required>
                <option value="pricing">Premium Pricing Plans</option>
                <option value="integration">API Integration</option>
                <option value="enterprise">Enterprise Solutions</option>
                <option value="partnership">Partnership Opportunities</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us more about your interest" rows="5"></textarea>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="contact-info">
            <div className="info-item">
              <h3>Email</h3>
              <p>support@pigeonrtc.com</p>
            </div>
            <div className="info-item">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://twitter.com/pigeonrtc" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://linkedin.com/company/pigeonrtc" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://github.com/pigeonrtc" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div> {/* End of "Follow Us" info-item */}
          </div> {/* End of contact-info */}
        </div> {/* End of contact-container */}
      </div> {/* End of contact-page */}
    </> /* Changed to shorthand fragment */
  );
};

export default ContactPage;
