require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

console.log('Starting email test...');
console.log('Using email service in:', process.env.NODE_ENV, 'mode');

const testUser = {
  email: 'neelivikas331@gmail.com',
  username: 'testuser'
};

console.log('Sending test email to:', testUser.email);

sendVerificationEmail(testUser, 'test-verification-token-123')
  .then((info) => {
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  })
  .catch(err => {
    console.error('❌ Error sending test email:');
    console.error(err);
    if (err.response) {
      console.error('SMTP Error:', err.response);
    }
  });
