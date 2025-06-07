import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const TermsOfService = () => {
  return (
    <LegalLayout 
      title="Terms of Service"
      description="These Terms of Service govern your use of the PigeonRTC platform."
    >
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the PigeonRTC platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service.</p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>PigeonRTC provides an AI agent marketplace that connects businesses with AI service providers. Our platform enables users to discover, test, and integrate various AI agents into their workflows.</p>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <h3>3.1 Account Creation</h3>
        <p>To access certain features, you must create an account. You agree to provide accurate and complete information and to keep this information updated.</p>
        
        <h3>3.2 Account Security</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        
        <h3>3.3 Account Termination</h3>
        <p>We reserve the right to suspend or terminate your account for any violation of these Terms or for any other reason at our sole discretion.</p>
      </section>

      <section>
        <h2>4. Use of the Service</h2>
        <h3>4.1 Permitted Use</h3>
        <p>You may use the Service only for lawful purposes and in accordance with these Terms.</p>
        
        <h3>4.2 Prohibited Activities</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal purpose</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Attempt to gain unauthorized access to the Service</li>
        </ul>
      </section>

      <section>
        <h2>5. Payments and Billing</h2>
        <h3>5.1 Fees</h3>
        <p>Some features of our Service may require payment. You agree to pay all fees and charges associated with your use of such features.</p>
        
        <h3>5.2 Billing</h3>
        <p>We use third-party payment processors to bill you. By providing your payment information, you authorize us to charge you for the features you use.</p>
      </section>

      <section>
        <h2>6. Intellectual Property</h2>
        <h3>6.1 Our Content</h3>
        <p>All content on the Service, including text, graphics, logos, and software, is our property or the property of our licensors.</p>
        
        <h3>6.2 Your Content</h3>
        <p>You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content.</p>
      </section>

      <section>
        <h2>7. Disclaimers and Limitation of Liability</h2>
        <h3>7.1 No Warranty</h3>
        <p>The Service is provided "as is" without any warranties of any kind, either express or implied.</p>
        
        <h3>7.2 Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      </section>

      <section>
        <h2>8. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. Your continued use of the Service after changes constitutes acceptance of the new Terms.</p>
      </section>

      <section>
        <h2>9. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at legal@pigeonrtc.com.</p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfService;
