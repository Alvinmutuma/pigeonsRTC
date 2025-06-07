import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout 
      title="Privacy Policy"
      description="Learn how PigeonRTC collects, uses, and protects your personal information."
    >
      <section>
        <h2>1. Introduction</h2>
        <p>Welcome to PigeonRTC ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI agent marketplace platform (the "Service").</p>
        <p>By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Information You Provide</h3>
        <p>We collect information you provide when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Use our AI agents or services</li>
          <li>Make purchases or transactions</li>
          <li>Contact customer support</li>
          <li>Participate in surveys or promotions</li>
        </ul>
        <p>This may include your name, email address, payment information, and other contact or identifying information.</p>

        <h3>2.2 Automatically Collected Information</h3>
        <p>We automatically collect certain information when you use our Service, including:</p>
        <ul>
          <li>Device information (e.g., IP address, browser type, operating system)</li>
          <li>Usage data (e.g., pages visited, features used, time spent)</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our Service</li>
          <li>Process transactions and send related information</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Send technical notices, updates, and security alerts</li>
          <li>Monitor and analyze usage and trends</li>
          <li>Personalize your experience</li>
          <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Sharing and Disclosure</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Service providers who perform services on our behalf</li>
          <li>Business partners and third-party vendors</li>
          <li>Law enforcement or government agencies when required by law</li>
          <li>Other parties in connection with a business transaction</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </section>

      <section>
        <h2>5. Your Rights and Choices</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>Accessing, updating, or deleting your information</li>
          <li>Objecting to or restricting processing</li>
          <li>Data portability</li>
          <li>Withdrawing consent</li>
        </ul>
        <p>To exercise these rights, please contact us at privacy@pigeonrtc.com.</p>
      </section>

      <section>
        <h2>6. Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
      </section>

      <section>
        <h2>7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@pigeonrtc.com.</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
