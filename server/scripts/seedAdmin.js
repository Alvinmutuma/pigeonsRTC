require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const adminCredentials = {
  username: 'admin',
  email: 'admin@pigeonrtc.com', 
  password: 'Admin@12345',  // Strong password meeting requirements
  role: 'admin'
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-agent-marketplace';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for admin seeding');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminCredentials.email }, { username: adminCredentials.username }]
    });

    if (existingAdmin) {
      console.log('Admin user already exists, not creating duplicate');
      process.exit(0);
    }

    // Create admin user (already verified)
    const adminUser = new User({
      ...adminCredentials,
      isVerified: true,
      dashboardPath: '/admin/dashboard'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Username: ${adminCredentials.username}`);
    console.log(`Email: ${adminCredentials.email}`);
    console.log('Remember to change this password after first login!');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
