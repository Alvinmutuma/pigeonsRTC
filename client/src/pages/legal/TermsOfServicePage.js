import React from 'react';
import LegalLayout from '../../components/legal/LegalLayout';

const TermsOfServicePage = () => {
  return (
    <LegalLayout 
      title="Terms of Service"
      description="These Terms of Service govern your use of the PigeonRTC platform and outline the rules and regulations for using our services."
    >
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the PigeonRTC platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Service.</p>
        <p>We reserve the right to modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the new Terms.</p>
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
          <li>Use any robot, spider, or other automated means to access the Service</li>
        </ul>
      </section>

      <section>
        <h2>5. AI Agents and Third-Party Content</h2>
        <h3>5.1 Third-Party AI Agents</h3>
        <p>Our Service includes AI agents created by third-party developers. We do not endorse or assume any responsibility for any third-party content.</p>
        
        <h3>5.2 No Warranty for AI Output</h3>
        <p>AI-generated content is provided "as is" without any warranty. We do not guarantee the accuracy, completeness, or usefulness of any AI-generated content.</p>
      </section>

      <section>
        <h2>6. Payments and Billing</h2>
        <h3>6.1 Fees</h3>
        <p>Certain features of the Service may require payment of fees. All fees are in USD and are non-refundable unless otherwise stated.</p>
        
        <h3>6.2 Subscriptions</h3>
        <p>Some services are offered on a subscription basis. By subscribing, you authorize us to charge your payment method on a recurring basis.</p>
        
        <h3>6.3 Price Changes</h3>
        <p>We may change our prices at any time. Price changes will be communicated to you in advance.</p>
      </section>

      <section>
        <h2>7. Intellectual Property</h2>
        <h3>7.1 Our Content</h3>
        <p>All content on the Service, including text, graphics, logos, and software, is our property or the property of our licensors.</p>
        
        <h3>7.2 Your Content</h3>
        <p>You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content.</p>
      </section>

      <section>
        <h2>8. Disclaimers and Limitation of Liability</h2>
        <h3>8.1 No Warranty</h3>
        <p>The Service is provided "as is" without any warranties of any kind, either express or implied.</p>
        
        <h3>8.2 Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      </section>

      <section>
        <h2>9. Indemnification</h2>
        <p>You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.</p>
      </section>

      <section>
        <h2>11. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <address>
          PigeonRTC Inc.<br />
          Attn: Legal Department<br />
          123 AI Avenue<br />
          Tech City, TC 12345<br />
          Email: legal@pigeonrtc.com
        </address>
      </section>
    </LegalLayout>
  );
};

export default TermsOfServicePage;
