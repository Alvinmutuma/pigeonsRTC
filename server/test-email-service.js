require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

async function testEmailService() {
  console.log('\n🚀 Starting Email Service Test\n');
  
  // Test configuration
  const testEmail = 'neelivikas331@gmail.com';
  const testSubject = 'PigeonRTC - Test Email';
  const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a2e; padding: 20px; color: white; text-align: center;">
        <h1>PigeonRTC</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Test Email</h2>
        <p>This is a test email sent from the PigeonRTC email service.</p>
        <p>If you're seeing this, the email service is working correctly! 🎉</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p>Sent by PigeonRTC Test Suite</p>
      </div>
    </div>
  `;

  try {
    console.log('📧 Sending test email to:', testEmail);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    const result = await sendEmail({
      to: testEmail,
      subject: testSubject,
      html: testHtml
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\nℹ️ Running in development mode - email was not actually sent');
      console.log('Set NODE_ENV=production and configure SMTP settings to send real emails');
    }
    
  } catch (error) {
    console.error('\n❌ Error sending test email:');
    console.error(error.message);
    
    if (error.response) {
      console.error('SMTP Error Details:', error.response);
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Verify your SMTP settings in .env');
      console.log('2. Check if your SendGrid API key is valid');
      console.log('3. Ensure the sender email is verified in SendGrid');
      console.log('4. Check your network connection and firewall settings');
    }
  }
}

// Run the test
testEmailService();
