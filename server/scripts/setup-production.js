require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const setupProduction = async () => {
  try {
    console.log('🚀 Starting production setup...');
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
    
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${process.env.ADMIN_USERNAME}`);
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during production setup:', error);
    process.exit(1);
  }
};

setupProduction();
