const nodemailer = require('nodemailer');

// Get email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.sendgrid.net';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || 'apikey';
const SMTP_PASS = process.env.SMTP_PASS || 'your_sendgrid_api_key';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pigeonrtc.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'PigeonRTC';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create a transporter
let transporter;

// Create a test email preview for development
const createDevTransport = () => ({
  name: 'dev-preview-transport',
  version: '1.0.0',
  send: (mail, callback) => {
    console.log('\n📧 Email would be sent in production:');
    console.log('To:', mail.data.to);
    console.log('Subject:', mail.data.subject);
    console.log('From:', mail.data.from);
    callback(null, { response: '250 Email accepted for delivery' });
  }
});

// Initialize transporter based on environment
if (NODE_ENV === 'production') {
  // Production: Use SendGrid SMTP
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER, // Should be 'apikey' for SendGrid
      pass: SMTP_PASS  // Your SendGrid API Key
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
  console.log('✅ SendGrid SMTP configured for production');
} else {
  // Development: Use preview logger
  transporter = nodemailer.createTransport(createDevTransport());
  console.log('🔧 Using email preview logger for development');
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      // SendGrid specific headers for tracking
      headers: {
        'X-SMTPAPI': JSON.stringify({
          filters: {
            clicktrack: { settings: { enable: 1 } },
            opentrack: { settings: { enable: 1 } }
          }
        })
      }
    };

    console.log(`Sending email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    if (NODE_ENV !== 'production') {
      console.log('📧 Email sent successfully (preview only in development)');
      console.log('Message ID:', info.messageId);
    } else {
      console.log('📧 Email sent successfully');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
    }
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Error details:', error);
    if (error.response) {
      console.error('SMTP Error:', error.response);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send verification email
 * @param {Object} user - User object
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a2e; padding: 20px; color: white; text-align: center;">
        <h1>PigeonRTC</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 4px 4px;">
        <h2>Verify Your Email</h2>
        <p>Hello ${user.username},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a7bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not sign up for PigeonRTC, please ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} PigeonRTC. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'PigeonRTC - Verify Your Email',
    html,
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} token - Reset token
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a2e; padding: 20px; color: white; text-align: center;">
        <h1>PigeonRTC</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 4px 4px;">
        <h2>Reset Your Password</h2>
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a7bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} PigeonRTC. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'PigeonRTC - Reset Your Password',
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
