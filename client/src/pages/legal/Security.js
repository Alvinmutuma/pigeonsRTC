import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const Security = () => {
  return (
    <LegalLayout 
      title="Security Policy"
      description="Learn about the security measures and practices we implement to protect your data."
    >
      <section>
        <h2>1. Introduction</h2>
        <p>At PigeonRTC, we take the security of your data seriously. This Security Policy outlines the measures we take to protect your information and ensure the integrity of our services.</p>
      </section>

      <section>
        <h2>2. Data Protection</h2>
        <h3>2.1 Encryption</h3>
        <p>All data transmitted between your device and our servers is encrypted using industry-standard TLS 1.2+ protocols. Data at rest is encrypted using AES-256 encryption.</p>
        
        <h3>2.2 Access Controls</h3>
        <p>We implement strict access controls to ensure that only authorized personnel have access to your data. Access is granted on a need-to-know basis and is regularly reviewed.</p>
      </section>

      <section>
        <h2>3. Infrastructure Security</h2>
        <h3>3.1 Cloud Infrastructure</h3>
        <p>Our services are hosted on secure cloud infrastructure with multiple layers of security, including network firewalls, DDoS protection, and intrusion detection systems.</p>
        
        <h3>3.2 Network Security</h3>
        <p>We implement network security measures including firewalls, network segmentation, and regular vulnerability scanning to protect against unauthorized access.</p>
      </section>

      <section>
        <h2>4. Application Security</h2>
        <h3>4.1 Secure Development</h3>
        <p>We follow secure software development lifecycle (SDLC) practices, including code reviews, static analysis, and automated security testing.</p>
        
        <h3>4.2 Regular Updates</h3>
        <p>We regularly update our systems and applications to protect against known vulnerabilities. Security patches are applied in a timely manner.</p>
      </section>

      <section>
        <h2>5. Incident Response</h2>
        <h3>5.1 Security Monitoring</h3>
        <p>We continuously monitor our systems for security incidents and have processes in place to detect, respond to, and recover from security events.</p>
        
        <h3>5.2 Breach Notification</h3>
        <p>In the event of a data breach, we will notify affected users in accordance with applicable laws and regulations.</p>
      </section>

      <section>
        <h2>6. Your Role in Security</h2>
        <h3>6.1 Account Security</h3>
        <p>You are responsible for maintaining the security of your account credentials. We recommend using strong, unique passwords and enabling multi-factor authentication when available.</p>
        
        <h3>6.2 Reporting Security Issues</h3>
        <p>If you discover a security vulnerability in our services, please report it to security@pigeonrtc.com. We appreciate responsible disclosure and will respond promptly to all reports.</p>
      </section>

      <section>
        <h2>7. Contact Us</h2>
        <p>If you have any questions about this Security Policy, please contact us at security@pigeonrtc.com.</p>
      </section>
    </LegalLayout>
  );
};

export default Security;
