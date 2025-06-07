const { ApolloServer } = require('apollo-server');
const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const { User } = require('./models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// Create a test server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    // Mock context for testing
  })
});

// Test user credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword';

async function testLogin() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clean up any existing test user
    await User.deleteOne({ email: TEST_EMAIL });

    // Create a test user
    const testUser = new User({
      email: TEST_EMAIL,
      username: 'testuser',
      password: TEST_PASSWORD,
      isVerified: true,
      role: 'USER'
    });

    await testUser.save();
    console.log('Test user created');

    // Test login with correct credentials
    console.log('\nTesting login with correct credentials...');
    const loginQuery = `
      mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
          token
          user {
            id
            email
            username
            role
            isVerified
          }
        }
      }
    `;

    const result = await server.executeOperation({
      query: loginQuery,
      variables: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }
    });

    if (result.errors) {
      console.error('Login test failed with errors:', result.errors);
    } else {
      console.log('Login successful!');
      console.log('User data:', JSON.stringify(result.data.loginUser.user, null, 2));
      console.log('Token received:', result.data.loginUser.token ? 'Yes' : 'No');
    }

    // Test login with incorrect password
    console.log('\nTesting login with incorrect password...');
    const wrongPassResult = await server.executeOperation({
      query: loginQuery,
      variables: {
        email: TEST_EMAIL,
        password: 'wrongpassword'
      }
    });

    if (wrongPassResult.errors && wrongPassResult.errors[0].message === 'Invalid email or password') {
      console.log('Test passed: Invalid password was rejected');
    } else {
      console.error('Test failed: Invalid password was not properly rejected');
    }

    // Test login with non-existent email
    console.log('\nTesting login with non-existent email...');
    const wrongEmailResult = await server.executeOperation({
      query: loginQuery,
      variables: {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      }
    });

    if (wrongEmailResult.errors && wrongEmailResult.errors[0].message === 'Invalid email or password') {
      console.log('Test passed: Non-existent email was rejected');
    } else {
      console.error('Test failed: Non-existent email was not properly rejected');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Clean up
    await User.deleteOne({ email: TEST_EMAIL });
    await mongoose.disconnect();
    await server.stop();
    httpServer.close();
    console.log('Test completed');
  }
}

testLogin().catch(console.error);
