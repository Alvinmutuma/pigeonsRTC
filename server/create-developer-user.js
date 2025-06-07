require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createDeveloperUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if developer test user already exists
    const existingUser = await User.findOne({ email: 'developer@example.com' });
    if (existingUser) {
      console.log('Developer test user already exists. Updating to ensure it is verified.');
      existingUser.isVerified = true;
      await existingUser.save();
      console.log('Developer test user updated successfully');
    } else {
      // Create a new developer test user
      const developerUser = new User({
        username: 'testdev',
        email: 'developer@example.com',
        password: 'Dev@123#', // This will be hashed by the pre-save hook
        role: 'developer',
        isVerified: true
      });
      
      await developerUser.save();
      console.log('Developer test user created successfully');
    }
    
    console.log('You can now log in with:');
    console.log('Email: developer@example.com');
    console.log('Password: Dev@123#');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createDeveloperUser();
