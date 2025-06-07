require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing test user if it exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Removed any existing test user');
    
    // Create a new test user
    // We'll use the User model directly so the pre-save hook handles password hashing properly
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@123#', // This will be hashed by the pre-save hook
      role: 'business_user',
      isVerified: true
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    console.log('You can now log in with:');
    console.log('Email: test@example.com');
    console.log('Password: Test@123#');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
