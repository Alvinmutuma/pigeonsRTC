import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const SecurityPage = () => {
  return (
    <LegalLayout 
      title="Security Policy"
      description="Learn about the security measures and practices we implement to protect your data on the PigeonRTC platform."
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
        
        <h3>2.3 Authentication</h3>
        <p>We require strong password policies and support multi-factor authentication (MFA) for all user accounts. We recommend enabling MFA for an additional layer of security.</p>
      </section>

      <section>
        <h2>3. Infrastructure Security</h2>
        <h3>3.1 Cloud Infrastructure</h3>
        <p>Our services are hosted on secure cloud infrastructure with multiple layers of security, including network firewalls, DDoS protection, and intrusion detection systems.</p>
        
        <h3>3.2 Data Centers</h3>
        <p>Our data centers are SOC 2 Type II compliant and employ physical security measures including 24/7 monitoring, biometric access controls, and environmental controls.</p>
        
        <h3>3.3 Network Security</h3>
        <p>We implement network security measures including firewalls, network segmentation, and regular vulnerability scanning to protect against unauthorized access.</p>
      </section>

      <section>
        <h2>4. Application Security</h2>
        <h3>4.1 Secure Development</h3>
        <p>We follow secure software development lifecycle (SDLC) practices, including code reviews, static analysis, and automated security testing.</p>
        
        <h3>4.2 Regular Updates</h3>
        <p>We regularly update our systems and applications to protect against known vulnerabilities. Security patches are applied in a timely manner.</p>
        
        <h3>4.3 API Security</h3>
        <p>Our APIs are secured using OAuth 2.0 and require authentication for all requests. Rate limiting and monitoring are in place to prevent abuse.</p>
      </section>

      <section>
        <h2>5. Data Management</h2>
        <h3>5.1 Data Minimization</h3>
        <p>We only collect and store the data necessary to provide our services. Unnecessary data is regularly purged from our systems.</p>
        
        <h3>5.2 Data Retention</h3>
        <p>We retain your data only for as long as necessary to provide our services or as required by law. When data is no longer needed, it is securely deleted.</p>
        
        <h3>5.3 Data Backups</h3>
        <p>Regular backups are performed to ensure data availability. Backups are encrypted and stored securely with restricted access.</p>
      </section>

      <section>
        <h2>6. Incident Response</h2>
        <h3>6.1 Security Monitoring</h3>
        <p>We continuously monitor our systems for security incidents and have processes in place to detect, respond to, and recover from security events.</p>
        
        <h3>6.2 Breach Notification</h3>
        <p>In the event of a data breach, we will notify affected users in accordance with applicable laws and regulations.</p>
        
        <h3>6.3 Security Audits</h3>
        <p>We conduct regular security audits and penetration testing to identify and address potential vulnerabilities.</p>
      </section>

      <section>
        <h2>7. Compliance</h2>
        <h3>7.1 Industry Standards</h3>
        <p>We comply with relevant industry standards and regulations, including GDPR, CCPA, and other applicable data protection laws.</p>
        
        <h3>7.2 Certifications</h3>
        <p>Our security practices are regularly reviewed as part of our compliance with industry standards and certifications.</p>
      </section>

      <section>
        <h2>8. Your Role in Security</h2>
        <h3>8.1 Account Security</h3>
        <p>You are responsible for maintaining the security of your account credentials. We recommend using strong, unique passwords and enabling multi-factor authentication.</p>
        
        <h3>8.2 Reporting Security Issues</h3>
        <p>If you discover a security vulnerability in our services, please report it to security@pigeonrtc.com. We appreciate responsible disclosure and will respond promptly to all reports.</p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>We may update this Security Policy from time to time. We will notify you of any material changes by posting the new policy on our website.</p>
      </section>

      <section>
        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Security Policy, please contact us at:</p>
        <address>
          PigeonRTC Inc.<br />
          Attn: Security Team<br />
          123 AI Avenue<br />
          Tech City, TC 12345<br />
          Email: security@pigeonrtc.com
        </address>
      </section>
    </LegalLayout>
  );
};

export default SecurityPage;
