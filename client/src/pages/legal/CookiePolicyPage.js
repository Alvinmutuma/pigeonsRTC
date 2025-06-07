import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const CookiePolicyPage = () => {
  return (
    <LegalLayout 
      title="Cookie Policy"
      description="Learn how PigeonRTC uses cookies and similar technologies to enhance your experience on our platform."
    >
      <section>
        <h2>1. Introduction</h2>
        <p>This Cookie Policy explains how PigeonRTC ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website or use our services. By using our services, you consent to the use of cookies as described in this policy.</p>
      </section>

      <section>
        <h2>2. What Are Cookies?</h2>
        <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners.</p>
      </section>

      <section>
        <h2>3. How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        
        <h3>3.1 Essential Cookies</h3>
        <p>These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.</p>
        
        <h3>3.2 Performance and Analytics</h3>
        <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.</p>
        
        <h3>3.3 Functionality</h3>
        <p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</p>
        
        <h3>3.4 Targeting/Advertising</h3>
        <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</p>
      </section>

      <section>
        <h2>4. Types of Cookies We Use</h2>
        <div className="cookie-types">
          <div className="cookie-type">
            <h4>Session Cookies</h4>
            <p>Temporary cookies that are deleted when you close your browser.</p>
          </div>
          <div className="cookie-type">
            <h4>Persistent Cookies</h4>
            <p>Remain on your device for a set period or until you delete them.</p>
          </div>
          <div className="cookie-type">
            <h4>First-party Cookies</h4>
            <p>Set by us to enable core functionality.</p>
          </div>
          <div className="cookie-type">
            <h4>Third-party Cookies</h4>
            <p>Set by third parties for analytics, advertising, and functionality.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>5. Managing Your Cookie Preferences</h2>
        <p>You can manage your cookie preferences through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>See what cookies you've got and delete them on an individual basis</li>
          <li>Block third-party cookies</li>
          <li>Block cookies from particular sites</li>
          <li>Block all cookies from being set</li>
          <li>Delete all cookies when you close your browser</li>
        </ul>
        <p>Please note that if you choose to block or delete cookies, certain features of our website may not function properly.</p>
      </section>

      <section>
        <h2>6. Third-Party Cookies</h2>
        <p>We work with third-party service providers who may also set cookies on our website. These third parties include:</p>
        <ul>
          <li>Analytics providers (e.g., Google Analytics)</li>
          <li>Advertising networks</li>
          <li>Social media platforms</li>
          <li>Customer support services</li>
        </ul>
        <p>We do not control these third-party cookies. Please refer to the respective privacy policies of these third parties for more information.</p>
      </section>

      <section>
        <h2>7. Changes to This Cookie Policy</h2>
        <p>We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on our website and updating the "Last Updated" date at the top of this page.</p>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>If you have any questions about this Cookie Policy, please contact us at:</p>
        <address>
          PigeonRTC Inc.<br />
          Attn: Privacy Team<br />
          123 AI Avenue<br />
          Tech City, TC 12345<br />
          Email: privacy@pigeonrtc.com
        </address>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicyPage;
