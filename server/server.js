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
let mongoUri = process.env.MONGODB_URI;

// Determine if running in production
// Render typically sets NODE_ENV to 'production' by default for Node.js services.
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !mongoUri) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set for the production environment.');
  console.error('This variable is essential for connecting to your database (e.g., MongoDB Atlas).');
  console.error('Please ensure MONGODB_URI is correctly configured in your deployment service (e.g., Render dashboard).');
  process.exit(1); // Exit immediately if MONGODB_URI is missing in production
}

// Fallback to localhost for non-production environments if MONGODB_URI is not set
if (!mongoUri) {
  console.warn('WARNING: MONGODB_URI is not set. Falling back to local MongoDB for development.');
  mongoUri = 'mongodb://localhost:27017/ai-agent-marketplace';
}

// Log connection attempt (conditionally masking Atlas URI)
if (mongoUri.startsWith('mongodb+srv')) {
  console.log('INFO: Attempting to connect to MongoDB Atlas (credentials hidden).');
} else {
  console.log(`INFO: Attempting to connect to MongoDB at ${mongoUri}`);
}
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
    const allowedOrigins = [
      'http://localhost:3000',         // Local client development
      'https://pigeonrtc-web.onrender.com', // Default Render frontend URL
      'https://www.pigeonrtc.com',     // Your custom domain
      'https://pigeonrtc.com'         // Your root custom domain
    ];

    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
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
      cache: "bounded", // Address unbounded cache warning for persisted queries
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