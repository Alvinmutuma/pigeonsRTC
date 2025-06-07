require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists. Updating to ensure it is verified.');
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('Test user updated successfully');
    } else {
      // Create a new test user with verification already completed
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('Test@123', 10),
        role: 'business_user',
        isVerified: true
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    }
    
    console.log('You can now log in with:');
    console.log('Email: test@example.com');
    console.log('Password: Test@123');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
