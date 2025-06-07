// server/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Configuration
const PORT = process.env.PORT || 4010;
const JWT_SECRET = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-agent-marketplace';
const mongooseOptions = {
  // For newer Mongoose versions, these are the defaults
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
};

// Main server startup function
async function startServer() {
  try {
    // --- Connect to MongoDB FIRST ---
    await mongoose.connect(mongoUri, mongooseOptions);
    console.log('MongoDB Connected Successfully');
    
    // Initialize Express app
    const app = express();
    
    // --- CORS Configuration ---
    const corsOptions = {
      origin: '*', // For development, allow all origins. For production, restrict to your frontend's URL.
      credentials: true, // Important for cookies, authorization headers with cookies
      allowedHeaders: ['Content-Type', 'Authorization'], // Crucially, allow Authorization
    };
    app.use(cors(corsOptions));
    
    // --- Start Agenda after MongoDB is connected ---
    const { startAgenda } = require('./config/agenda'); // Import here after MongoDB connection
    startAgenda();
    
    // --- Now that Mongoose is connected, import modules that use Mongoose models ---
    const typeDefs = require('./graphql/typeDefs');
    const resolvers = require('./graphql/resolvers');
    const { ApolloServer } = require('apollo-server-express');
    
    // Authentication context function
    const serverContext = ({ req }) => {
      console.log('Attempting to authenticate user...');
      const authHeader = req.headers.authorization || '';
      console.log('Auth Header:', authHeader);
      
      if (authHeader) {
        const tokenParts = authHeader.split('Bearer ');
        if (tokenParts.length === 2) {
          const token = tokenParts[1];
          console.log('Token found:', token);
          try {
            const decodedTokenPayload = jwt.verify(token, JWT_SECRET);
            console.log('Decoded Token Payload:', decodedTokenPayload);
            if (decodedTokenPayload && decodedTokenPayload.id) {
              // console.log('User ID from token:', decodedTokenPayload.id); // Hidden as per user request
              return { user: decodedTokenPayload };
            } else {
              console.error('Token decoded, but ID missing in payload.');
              return { user: null };
            }
          } catch (err) {
            console.error('Token verification failed (Invalid/Expired):', err.message);
            return { user: null };
          }
        } else {
          console.log('Auth header present, but not Bearer token or malformed.');
          return { user: null };
        }
      }
      console.log('No auth header found.');
      return { user: null };
    };
    
    // Initialize Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: serverContext,
    });
    
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    
    // Basic route
    app.get('/', (req, res) => {
      res.send('PigeonRTC API is running!');
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
    
  } catch (err) {
    console.error('MongoDB Connection Error or Server Startup Error:', err);
    process.exit(1); // Exit if DB connection or subsequent setup fails
  }
}

// Start the server and handle any uncaught errors
startServer().catch(error => {
  console.error('Failed to start the server (outer catch):', error);
  process.exit(1);
});