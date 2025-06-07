const Agent = require('../models/Agent');
const User = require('../models/User');
const Review = require('../models/Review');
const ForumCategory = require('../models/ForumCategory');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
// Importing billing models
const { UsageRecord, Subscription, Invoice } = require('../models/Billing');
const jwt = require('jsonwebtoken');
const { AuthenticationError, UserInputError, ApolloError } = require('apollo-server-express');
// Axios might still be needed for other resolvers, remove if not.
const axios = require('axios'); // Assuming axios is used, otherwise remove if not needed elsewhere 
const { agenda } = require('../config/agenda.js'); // Import agenda
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/emailService');
const crypto = require('crypto'); // Added for verification token generation
// Import review resolvers
const reviewResolvers = require('./resolvers/reviewResolvers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1d'; 

// Helper function to handle MongoDB ObjectId serialization for GraphQL
const serializeDocument = (doc) => {
  if (!doc) return null;
  
  // Convert to plain object if it's a Mongoose document
  const serialized = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  
  // Handle the main document ID
  if (serialized._id) {
    serialized.id = serialized._id.toString();
  }
  
  // Process all fields to handle nested objects and arrays
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    
    // Skip null/undefined values
    if (value == null) return;
    
    // Convert empty objects to null for string fields to avoid GraphQL serialization errors
    if (typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value) && Object.keys(value).length === 0) {
      serialized[key] = null;
      return;
    }
    
    // Handle ObjectId references (common for relations)
    if (value._id && typeof value._id.toString === 'function') {
      value.id = value._id.toString();
    }
    
    // Handle arrays (e.g., for one-to-many relationships)
    if (Array.isArray(value)) {
      serialized[key] = value.map(item => {
        if (item && typeof item === 'object') {
          // Ensure all necessary user fields are returned, including isVerified
          if (item instanceof User) {
            const userToReturn = {
              id: item._id,
              username: item.username,
              email: item.email,
              role: item.role,
              isVerified: item.isVerified,
              dashboardPath: item.dashboardPath,
              createdAt: item.createdAt, // if needed by client
              updatedAt: item.updatedAt, // if needed by client
              // Add other fields as defined in your User type and needed by GET_ME
            };
            return serializeDocument(userToReturn); // Apply serialization to the explicitly constructed object
          } else {
            return serializeDocument(item);
          }
        }
        return item;
      });
    }
    // Handle nested objects
    else if (value && typeof value === 'object' && !(value instanceof Date) && !Buffer.isBuffer(value)) {
      serialized[key] = serializeDocument(value);
    }
  });
  
  return serialized;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email
    },
    JWT_SECRET, 
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

const resolvers = {
  Query: {
    // Review queries
    agentReviews: reviewResolvers.Query.agentReviews,
    myReviews: reviewResolvers.Query.myReviews,
    userReviewForAgent: reviewResolvers.Query.userReviewForAgent,
    pendingReviews: reviewResolvers.Query.pendingReviews,
    
    async forumCategories() {
      try {
        const categories = await ForumCategory.find().sort({ name: 1 });
        // Use the serialization helper to properly convert MongoDB ObjectIds to strings
        return categories.map(category => serializeDocument(category));
      } catch (error) {
        console.error('Error fetching forum categories:', error);
        throw new Error('Failed to fetch forum categories.');
      }
    },
    hello: () => 'Hello from the AI Agent Marketplace API!',
    agents: async (_, { searchTerm, category, status, minPrice, maxPrice, tags }) => {
      try {
        const query = {}; // Start with a fresh query object

        // Search Term (Regex for broader matching)
        if (searchTerm && searchTerm.trim() !== '') {
          const term = searchTerm.trim();
          console.log(`[Resolver] Applying searchTerm (regex): '${term}'`);
          query.$or = [
            { name: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { tags: { $regex: term, $options: 'i' } } // Searches if any tag in the array matches
            // Note: category is handled separately below if also provided
          ];
        } else {
          console.log('[Resolver] No searchTerm applied.');
        }
        
        // Category (Case-insensitive, partial match)
        if (category && category.trim() !== '') {
          const trimmedCategory = category.trim();
          console.log(`[Resolver] Applying category filter (flexible): '${trimmedCategory}'`);
          // Matches if the category CONTAINS the trimmedCategory, case-insensitive
          query.category = { $regex: new RegExp(trimmedCategory, 'i') }; 
        } else {
          console.log('[Resolver] No category filter applied or category is empty.');
        }

        // Status (case-insensitive matching)
        if (status && status.trim() !== '') { 
          const trimmedStatus = status.trim().toLowerCase();
          console.log(`[Resolver] Applying status filter (case-insensitive): '${trimmedStatus}'`);
          // Use regex for case-insensitive matching
          query.status = { $regex: new RegExp(`^${trimmedStatus}$`, 'i') };
        } else {
          console.log('[Resolver] No status filter applied (e.g., All Statuses or status is empty).');
        }

        // Price
        const priceConditions = {};
        if (typeof minPrice === 'number' && !isNaN(minPrice)) {
          console.log(`[Resolver] Applying minPrice filter: ${minPrice}`);
          priceConditions.$gte = minPrice;
        }
        if (typeof maxPrice === 'number' && !isNaN(maxPrice)) {
          console.log(`[Resolver] Applying maxPrice filter: ${maxPrice}`);
          priceConditions.$lte = maxPrice;
        }

        if (Object.keys(priceConditions).length > 0) {
          query['pricing.amount'] = priceConditions; // Query on the nested 'amount' field
          // Optional: Add a condition to only apply price filter to relevant pricing types
          // query['pricing.type'] = { $in: ['SUBSCRIPTION', 'PAY_PER_USE'] };
        } else {
          console.log('[Resolver] No price filter applied.');
        }

        // Tags (if you want a separate tags filter in addition to searchTerm potentially matching tags)
        // This example assumes 'tags' is an array of strings in your schema
        if (tags && tags.length > 0) {
          const validTags = tags.filter(tag => tag && tag.trim() !== '').map(tag => tag.trim());
          if (validTags.length > 0) {
            console.log(`[Resolver] Applying tags filter (exact match, case-insensitive):`, validTags);
            // If you want partial match for tags as well, use $regex for each tag
            // query.tags = { $all: validTags.map(tag => new RegExp(tag, 'i')) }; // All tags must be present (partial match)
            query.tags = { $in: validTags.map(tag => new RegExp(`^${tag}$`, 'i')) }; // Any of the exact tags (case-insensitive)
          } else {
            console.log('[Resolver] No valid tags provided for filtering.');
          }
        } else {
          console.log('[Resolver] No tags filter applied.');
        }

        console.log('[Resolver] Agent.find query:', JSON.stringify(query));

        const allAgents = await Agent.find(query).populate('developer');
        return allAgents;
      } catch (error) {
        console.error('Error fetching agents:', error);
        throw new Error('Failed to fetch agents.');
      }
    },
    agent: async (_, { id }) => {
      try {
        const singleAgent = await Agent.findById(id).populate('developer');
        if (!singleAgent) {
          throw new Error('Agent not found.');
        }
        // Use the serialization helper to convert ObjectIds to strings
        return serializeDocument(singleAgent);
      } catch (error) {
        console.error(`Error fetching agent with id ${id}:`, error);
        throw new Error('Failed to fetch agent.');
      }
    },
    me: async (parent, args, context) => {
      if (!context.user || !context.user.id) {
        return null; // Or throw new AuthenticationError('You must be logged in to query this schema');
      }
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          // This case should ideally not happen if token validation is robust
          // and context.user.id is valid.
          console.error(`ME_QUERY: User not found with id: ${context.user.id} from token.`);
          throw new AuthenticationError('User not found from token.');
        }
        // Construct a plain object to ensure all necessary fields, including isVerified, are present before serialization
        const userToReturn = {
          id: user._id.toString(), // Explicitly convert ObjectId to string
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified, // <<< Ensure isVerified is returned
          dashboardPath: user.dashboardPath,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        return serializeDocument(userToReturn);
      } catch (error) {
        console.error('Error fetching current user (me):', error);
        throw new Error('Failed to fetch current user.');
      }
    },
    pendingAgents: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new AuthenticationError('You must be an admin to access pending agents.');
      }
      try {
        const agents = await Agent.find({ status: 'pending_approval' }).populate('developer');
        return agents;
      } catch (error) {
        console.error('Error fetching pending agents:', error);
        throw new Error('Failed to fetch pending agents.');
      }
    },
    myAgents: async (_, __, context) => {
      if (!context.user || !context.user.id) {
        throw new AuthenticationError('You must be logged in to view your agents.');
      }
      try {
        const agents = await Agent.find({ developer: context.user.id }).populate('developer');
        return agents;
      } catch (error) {
        console.error('Error fetching agents for current user:', error);
        throw new Error('Failed to fetch your agents.');
      }
    },
    forumCategories: async () => {
      const categories = await ForumCategory.find({}).sort({ name: 1 });
      return categories.map(category => serializeDocument(category));
    },
    forumCategory: async (_, { identifier }) => {
      let category = await ForumCategory.findOne({ slug: identifier }).populate('creator');
      if (!category) {
        // Check if the identifier could be an ObjectId (basic check for 24 hex chars)
        if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
          category = await ForumCategory.findById(identifier).populate('creator');
        }
      }
      if (!category) {
        // It's good practice to throw an error or return null consistently
        // For now, returning null if not found by either slug or valid ID.
        // Consider throwing a new UserInputError('Category not found.') if preferred.
        return null; 
      }
      return serializeDocument(category);
    },
    forumPosts: async (_, { categoryId, authorId, tag, sortBy, limit = 10, offset = 0 }) => {
      const query = {};
      let actualCategoryId = categoryId;

      if (categoryId) {
        // Check if categoryId is a slug (not a 24-char hex string)
        if (typeof categoryId === 'string' && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
          const categoryDoc = await ForumCategory.findOne({ slug: categoryId });
          if (categoryDoc) {
            actualCategoryId = categoryDoc._id;
          } else {
            // Category not found by slug, perhaps return empty or throw specific error
            return { posts: [], totalCount: 0 }; 
          }
        } else if (typeof categoryId === 'string' && categoryId.match(/^[0-9a-fA-F]{24}$/)) {
          // It's an ObjectId string, can be used directly or cast if necessary by Mongoose
          actualCategoryId = categoryId;
        } else {
          // Invalid categoryId format, handle error or return empty
          return { posts: [], totalCount: 0 };
        }
        query.category = actualCategoryId;
      }
      if (authorId) query.author = authorId;
      if (tag) query.tags = tag; // Assumes tag is a single string to match in the array

      let sortOption = { createdAt: -1 }; // Default sort
      if (sortBy) {
        if (sortBy === 'upvotes_DESC') sortOption = { upvotes: -1, createdAt: -1 };
        if (sortBy === 'views_DESC') sortOption = { views: -1, createdAt: -1 };
        // Add more sort options as needed
      }

      try {
        // First, get the total count of documents matching the query
        const totalCount = await ForumPost.countDocuments(query);

        // Then, fetch the paginated posts
        const posts = await ForumPost.find(query)
          .sort(sortOption)
          .skip(offset)
          .limit(limit)
          .populate('author')
          .populate('category');
        
        return {
          posts,
          totalCount,
        };
      } catch (error) {
        console.error("Error fetching forum posts:", error);
        throw new Error('Failed to fetch forum posts.');
      }
    },
    forumPost: async (_, { id }, context) => {
      try {
        const post = await ForumPost.findById(id);

        if (!post) {
          throw new UserInputError('Forum post not found.');
        }

        if (context.user) {
          const userId = context.user.id;
          // Check if user is not the author and has not viewed it yet
          if (post.author.toString() !== userId && !post.viewedBy.includes(userId)) {
            post.viewedBy.push(userId);
            post.views += 1;
            await post.save();
          }
        } 
        // For guest users, views are not uniquely tracked or incremented here by default.
        // If general view increment for guests is desired, it would be handled differently,
        // e.g., a simple increment without adding to viewedBy.

        // Populate fields before returning. Fetch again to ensure latest data if saved.
        return ForumPost.findById(id).populate('author').populate('category');
      } catch (error) {
        console.error(`Error fetching forum post ${id}:`, error);
        throw new ApolloError('Failed to fetch forum post.', 'FORUM_POST_FETCH_ERROR');
      }
    },
    mySubscription: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view subscription details');
      }
      
      // Try to find an existing subscription
      let subscription = await Subscription.findOne({ userId: user.id });
      
      // If no subscription exists, create a mock trial subscription
      if (!subscription) {
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(now.getDate() + 14); // 14-day trial
        
        subscription = {
          id: `subscription_${user.id}`,
          userId: user.id,
          planId: 'basic',
          planName: 'Basic',
          status: 'trialing',
          startDate: now.toISOString(),
          endDate: null,
          trialEndsAt: trialEnd.toISOString(),
          monthlyQuota: 5000,
          currentUsage: Math.floor(Math.random() * 500),
          autoRenew: true
        };
      }
      
      return serializeDocument(subscription);
    },
    myInvoices: async (_, { limit = 10, offset = 0 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view invoices');
      }
      
      // Get invoices from database or generate mock data
      const invoices = [];
      const now = new Date();
      
      // Generate mock invoices for demo purposes
      for (let i = 0; i < limit; i++) {
        const invoiceDate = new Date(now);
        invoiceDate.setMonth(now.getMonth() - i);
        
        invoices.push({
          id: `invoice_${user.id}_${i}`,
          invoiceNumber: `INV-${100000 + i}`,
          userId: user.id,
          amount: 29.99,
          currency: 'USD',
          status: i === 0 ? 'open' : 'paid',
          dueDate: new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          paidDate: i === 0 ? null : new Date(invoiceDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              description: `Professional Subscription - ${invoiceDate.toLocaleString('default', { month: 'long' })} ${invoiceDate.getFullYear()}`,
              amount: 29.99,
              quantity: 1
            }
          ],
          pdf: `https://example.com/invoices/invoice_${user.id}_${i}.pdf`,
          createdAt: invoiceDate.toISOString()
        });
      }
      
      return {
        invoices,
        totalCount: 12 // Assume 12 months of history
      };
    },
    myUsage: async (_, { startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view usage data');
      }
      
      // Convert string dates to Date objects
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      const end = endDate ? new Date(endDate) : new Date();
      
      // Generate random total usage
      const totalUsage = Math.floor(Math.random() * 1000) + 500;
      
      // Generate daily usage data
      const usageByDay = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        usageByDay.push({
          date: currentDate.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 10
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Generate agent usage data (mock data)
      const agents = await Agent.find({ status: 'active' }).limit(3);
      const usageByAgent = agents.map(agent => ({
        agent: serializeDocument(agent),
        count: Math.floor(Math.random() * 300) + 50
      }));
      
      return {
        total: totalUsage,
        usageByDay,
        usageByAgent
      };
    },
    availablePlans: async () => {
      // Sample subscription plans - in a production app, these would likely come from a database
      return [
        {
          id: 'basic',
          name: 'Basic',
          description: 'Perfect for individuals and small projects',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '5,000 API calls per month',
            'Access to public agents',
            'Community support',
            'Basic analytics'
          ],
          limits: {
            apiCalls: 5000,
            agents: 5,
            teamMembers: 1
          },
          isPopular: false,
          isBusiness: false
        },
        {
          id: 'pro',
          name: 'Professional',
          description: 'Ideal for professionals and growing teams',
          price: 29.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '25,000 API calls per month',
            'Access to all agents',
            'Priority support',
            'Advanced analytics',
            'Custom integrations'
          ],
          limits: {
            apiCalls: 25000,
            agents: 15,
            teamMembers: 5
          },
          isPopular: true,
          isBusiness: false
        },
        {
          id: 'business',
          name: 'Business',
          description: 'Enterprise-grade capabilities for organizations',
          price: 99.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '100,000 API calls per month',
            'Unlimited agent access',
            '24/7 dedicated support',
            'Advanced analytics and reporting',
            'Custom integration development',
            'Team management',
            'SLA guarantees'
          ],
          limits: {
            apiCalls: 100000,
            agents: 50,
            teamMembers: 25
          },
          isPopular: false,
          isBusiness: true
        }
      ];
    },
  },
  Mutation: {
    // Review mutations
    createReview: reviewResolvers.Mutation.createReview,
    updateReview: reviewResolvers.Mutation.updateReview,
    deleteReview: reviewResolvers.Mutation.deleteReview,
    markReviewHelpful: reviewResolvers.Mutation.markReviewHelpful,
    updateReviewStatus: reviewResolvers.Mutation.updateReviewStatus,
    
    placeholderMutation: (_, { input }) => {
        return `Received: ${input || 'nothing'}`;
    },
    createAgent: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create an agent.');
      }
      if (context.user.role !== 'developer' && context.user.role !== 'admin') {
        throw new AuthenticationError('Only developers or admins can create agents.');
      }

      try {
        // Validate input.integrationDetails.authentication based on type
        if (input.integrationDetails && input.integrationDetails.authentication) {
          const auth = input.integrationDetails.authentication;
          if (auth.type === 'API_KEY' && (!auth.apiKeyDetails || !auth.apiKeyDetails.name || !auth.apiKeyDetails.in)) {
            throw new UserInputError('API Key name and location (in) are required for API_KEY authentication.');
          }
        }

        let parsedDefaultConfig = {};
        if (input.defaultConfig) {
          try {
            parsedDefaultConfig = JSON.parse(input.defaultConfig);
          } catch (e) {
            throw new UserInputError('Invalid JSON format for defaultConfig.');
          }
        }

        const newAgentData = {
          ...input, // This will include the 'pricing' object from the input
          developer: context.user.id,
          defaultConfig: parsedDefaultConfig,
          automatedVettingInfo: { 
            apiUrlCheck: { status: 'PENDING', details: 'API URL check pending.' }, 
            docUrlCheck: { status: 'PENDING', details: 'Documentation URL check pending.' } 
          },
          status: context.user.role === 'admin' ? (input.status || 'active') : 'pending_approval',
        };
        // Remove price if it's somehow still in input, as it's replaced by pricing
        delete newAgentData.price; 

        const newAgent = new Agent(newAgentData);
        await newAgent.save();

        // Schedule jobs with Agenda (if applicable)
        if (newAgent.integrationDetails && newAgent.integrationDetails.type === 'api' && newAgent.integrationDetails.apiUrl) {
          agenda.now('check api url', { agentId: newAgent.id, apiUrl: newAgent.integrationDetails.apiUrl });
        }
        if (newAgent.integrationDetails && newAgent.integrationDetails.externalDocumentationLink) {
          agenda.now('check doc url', { agentId: newAgent.id, docUrl: newAgent.integrationDetails.externalDocumentationLink });
        }

        return newAgent.populate('developer');
      } catch (error) {
        console.error('Error creating agent:', error);
        if (error.code === 11000) { // Handle duplicate key error (e.g., unique agent name)
          throw new UserInputError('Agent name already exists.');
        }
        throw new Error(`Failed to create agent: ${error.message}`);
      }
    },
    registerUser: async (_, { input }) => {
      console.log('[Resolver START] registerUser for email:', input.email, 'and username:', input.username);
      const { username, email, password, role } = input;
      try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
          throw new Error('User already exists with that email or username.');
        }

        // Create user with the role provided in the input
        const user = new User({ username, email, password, role });
        await user.save();
        console.log('New user saved with ID:', user.id);

        // Generate verification token and send email
        try {
          const verificationToken = crypto.randomBytes(32).toString('hex');
          user.verificationToken = verificationToken;
          user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          await user.save(); // Save again to store token and expiry
          console.log('Verification token set for user:', user.email);

          console.log('Attempting to send verification email to:', user.email);
          await sendVerificationEmail({ email: user.email, username: user.username }, verificationToken);
          console.log('Verification email sent successfully to:', user.email);
        } catch (emailError) {
          console.error('Error sending verification email during registration for user:', user.email, emailError);
          // Decide if you want to throw an error here or just log it and proceed.
          // For now, we'll log it and let the registration succeed, but the user won't get an email.
          // In a production scenario, you might want to handle this more robustly.
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            username: user.username, 
            role: user.role,
            dashboardPath: user.dashboardPath
          }, 
          JWT_SECRET, 
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Ensure createdAt is a valid date
        const createdAt = user.createdAt 
          ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt)
          : new Date().toISOString();

        // Return token and user data
        return {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            dashboardPath: user.dashboardPath,
            createdAt,
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error registering user:', error);
        throw new Error(error.message || 'Failed to register user.');
      }
    },
    loginUser: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid credentials. User not found.');
        }

        // Check if user is verified
        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        // Check if account is locked due to too many failed attempts
        if (user.lockUntil && user.lockUntil > Date.now()) {
          throw new Error('Account is temporarily locked. Please try again later.');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          // Increment failed login attempts
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          
          // Lock account after 5 failed attempts
          if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
          }
          
          await user.save();
          throw new Error('Invalid credentials. Password incorrect.');
        }

        // Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const token = generateToken(user);

        return { 
          token, 
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
            dashboardPath: user.dashboardPath
          }
        };
      } catch (error) {
        console.error('Error logging in user:', error);
        throw new Error(error.message || 'Failed to login.');
      }
    },
    async resendVerificationEmail(_, { email }) {
      console.log('[Resolver START] resendVerificationEmail for:', email);
      try {
        const user = await User.findOne({ email });
        if (!user) {
          console.log(`Resend verification: No user found with email ${email}. Returning true.`);
          return true; // Still return true as per schema, even if user not found
        }
        if (user.isVerified) {
          console.log(`Resend verification: User ${email} is already verified. Returning true.`);
          return true; // Already verified, success
        }

        // Generate new verification token and expiry
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await user.save();

        try {
          await sendVerificationEmail({ email: user.email, username: user.username || 'User' }, verificationToken);
          console.log(`Verification email resent to ${user.email}`);
        } catch (emailError) {
          console.error('Error sending verification email during resend:', emailError);
          // Even if email sending fails, we might still want to return true to the client,
          // as the token has been updated. The user can try again or contact support.
          // This depends on desired UX.
          console.log('[Resolver INFO] Email sending failed during resend, but proceeding to return true.');
        }
        console.log('[Resolver END] Successfully processed resendVerificationEmail. Returning true.');
        return true;
      } catch (error) {
        console.error('Error in resendVerificationEmail (outer catch):', error);
        // Ensure a boolean is returned even in case of unexpected errors
        console.log('[Resolver END - Outer Catch] Error occurred, but returning true as per non-nullable schema.');
        return true;
      }
    },
    verifyEmail: async (_, { token }) => {
      console.log('[Resolver START] verifyEmail for token:', token);
      try {
        const user = await User.findOne({
          verificationToken: token,
          verificationExpires: { $gt: Date.now() }
        });

        if (!user) {
          console.log('[Resolver INFO] Invalid or expired verification token:', token);
          throw new UserInputError('Invalid or expired verification token');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();
        console.log('[Resolver INFO] User verified successfully (pre-save):', user.email);

        // Re-fetch the user to ensure all fields, including timestamps, are current
        const verifiedUser = await User.findById(user.id);
        if (!verifiedUser) {
          // This should ideally not happen if the save was successful
          console.error('[Resolver ERROR] Failed to re-fetch user after verification for ID:', user.id);
          throw new Error('An error occurred during email verification: User not found post-save.');
        }
        console.log('[Resolver INFO] User re-fetched successfully (post-fetch):', verifiedUser.email);
        
        // <<< NEW LOGGING START >>>
        console.log('[Resolver DEBUG] verifiedUser BEFORE serializeDocument:', JSON.stringify(verifiedUser, null, 2));
        console.log('[Resolver DEBUG] verifiedUser.createdAt BEFORE serializeDocument:', verifiedUser.createdAt, typeof verifiedUser.createdAt);
        // <<< NEW LOGGING END >>>

        const jwtToken = jwt.sign(
          { id: verifiedUser.id, email: verifiedUser.email, username: verifiedUser.username, role: verifiedUser.role, dashboardPath: verifiedUser.dashboardPath },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        const userPayload = serializeDocument(verifiedUser);

        // <<< NEW LOGGING START >>>
        console.log('[Resolver DEBUG] userPayload AFTER serializeDocument:', JSON.stringify(userPayload, null, 2));
        console.log('[Resolver DEBUG] userPayload.createdAt AFTER serializeDocument:', userPayload ? userPayload.createdAt : 'userPayload is null/undefined', userPayload ? typeof userPayload.createdAt : 'N/A');
        // <<< NEW LOGGING END >>>
        
        console.log('[Resolver END] verifyEmail successful. Returning token and user.');
        return {
          token: jwtToken,
          user: userPayload // Use the variable
        };
      } catch (error) {
        console.error('Error in verifyEmail:', error);
        // Propagate UserInputError, otherwise throw generic error
        if (error instanceof UserInputError) throw error;
        throw new Error('An error occurred during email verification.');
      }
    },
    forgotPassword: async (_, { email }) => {
      console.log('[Resolver START] forgotPassword for email:', email);
      try {
        const user = await User.findOne({ email });
        if (!user) {
          console.log(`[Resolver INFO] forgotPassword: No user found with email ${email}. Returning true to prevent enumeration.`);
          return true; // Prevent email enumeration
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        console.log(`[Resolver INFO] Reset token generated for ${email}.`);

        try {
          await sendPasswordResetEmail({ email: user.email, username: user.username || 'User' }, resetToken);
          console.log(`Password reset email sent to ${user.email}`);
        } catch (emailError) {
          console.error('Error sending password reset email:', emailError);
          // Log error but still return true as token is saved.
        }
        console.log('[Resolver END] forgotPassword processed. Returning true.');
        return true;
      } catch (error) {
        console.error('Error in forgotPassword:', error);
        // Return true to prevent detailed error leakage, matching original logic's intent
        return true; 
      }
    },
    resetPassword: async (_, { token, newPassword }) => {
      console.log('[Resolver START] resetPassword for token:', token);
      try {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
          console.log('[Resolver INFO] Invalid or expired reset token:', token);
          throw new UserInputError('Invalid or expired reset token');
        }

        user.password = newPassword; // The pre-save hook in User model should hash this
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.failedLoginAttempts = 0; // Reset failed attempts
        user.lockUntil = undefined; // Unlock account
        await user.save();
        console.log('[Resolver INFO] Password reset successfully for user:', user.email);
        console.log('[Resolver END] resetPassword successful. Returning true.');
        return true;
      } catch (error) {
        console.error('Error in resetPassword:', error);
        if (error instanceof UserInputError) throw error;
        throw new Error('An error occurred while resetting your password.');
      }
    },
    updateAgentStatus: async (_, { agentId, status }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new AuthenticationError('You must be an admin to update agent status.');
      }
      try {
        const agentToUpdate = await Agent.findById(agentId);
        if (!agentToUpdate) {
          throw new Error('Agent not found.');
        }

        agentToUpdate.status = status;

        // If status is being set to pending_approval, (re-)schedule the checks
        if (status === 'pending_approval') {
          // Update status to QUEUED before scheduling
          agentToUpdate.automatedVettingInfo.apiUrlCheck = {
            ...agentToUpdate.automatedVettingInfo.apiUrlCheck, // preserve existing data like lastChecked if needed
            status: 'QUEUED',
            httpStatusCode: null,
            details: 'API URL check is re-queued.',
            lastChecked: new Date(),
          };
          agentToUpdate.automatedVettingInfo.docUrlCheck = {
            ...agentToUpdate.automatedVettingInfo.docUrlCheck,
            status: 'QUEUED',
            httpStatusCode: null,
            details: 'Documentation URL check is re-queued.',
            lastChecked: new Date(),
          };
          await agentToUpdate.save(); // Save with QUEUED status before jobs run

          if (agentToUpdate.integrationDetails && agentToUpdate.integrationDetails.type === 'api' && agentToUpdate.integrationDetails.apiUrl) {
            await agenda.now('check agent api url', { agentId: agentToUpdate.id });
            console.log(`[Resolver] Re-scheduled API URL check for agent ${agentToUpdate.id}`);
          } else {
            agentToUpdate.automatedVettingInfo.apiUrlCheck = {
                status: 'NOT_APPLICABLE',
                lastChecked: new Date(),
                httpStatusCode: null,
                details: 'Agent is not API type or API URL is missing for vetting.',
            };
          }

          if (agentToUpdate.integrationDetails && agentToUpdate.integrationDetails.externalDocumentationLink) {
            await agenda.now('check agent doc url', { agentId: agentToUpdate.id });
            console.log(`[Resolver] Re-scheduled Doc URL check for agent ${agentToUpdate.id}`);
          } else {
            agentToUpdate.automatedVettingInfo.docUrlCheck = {
                status: 'NOT_APPLICABLE',
                lastChecked: new Date(),
                httpStatusCode: null,
                details: 'No documentation URL provided for vetting.',
            };
          }
          await agentToUpdate.save(); // Save again with any NOT_APPLICABLE or after queuing
        }
        // If status is changed to 'approved' or 'rejected', we might want to clear or archive old checks,
        // but for now, we'll leave the last check result.

        await agentToUpdate.save();
        return agentToUpdate;
      } catch (error) {
        console.error(`Error updating status for agent ${agentId}:`, error);
        throw new Error(`Failed to update agent status: ${error.message}`);
      }
    },
    updateAgent: async (_, { agentId, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update an agent.');
      }

      const agentToUpdate = await Agent.findById(agentId);
      if (!agentToUpdate) {
        throw new Error('Agent not found.');
      }

      if (agentToUpdate.developer.toString() !== context.user.id && context.user.role !== 'admin') {
        throw new AuthenticationError('You are not authorized to update this agent.');
      }

      if (input.status && context.user.role !== 'admin') {
        throw new AuthenticationError('Only admins can change agent status directly.');
      }
      if (context.user.role === 'admin' && input.status) {
        agentToUpdate.status = input.status;
      }

      // Destructure input, including the new 'pricing' field and excluding the old 'price'
      const { name, description, category, useCases, integrationDetails, sandbox, customizationGuide, defaultConfig, tags, pricing } = input;

      if (name !== undefined) agentToUpdate.name = name;
      if (description !== undefined) agentToUpdate.description = description;
      if (category !== undefined) agentToUpdate.category = category;
      if (useCases !== undefined) agentToUpdate.useCases = useCases;
      if (tags !== undefined) agentToUpdate.tags = tags;
      if (customizationGuide !== undefined) agentToUpdate.customizationGuide = customizationGuide;
      
      if (defaultConfig !== undefined) {
        if (defaultConfig === null || defaultConfig.trim() === '') {
          agentToUpdate.defaultConfig = {};
        } else {
          try {
            agentToUpdate.defaultConfig = JSON.parse(defaultConfig);
          } catch (e) {
            throw new UserInputError('Invalid JSON format for defaultConfig.');
          }
        }
      }
      
      // Handle pricing update
      if (pricing) { // If pricing object is provided in input
        // Create a new object for pricing to ensure sub-document change detection
        const newPricing = { ...agentToUpdate.pricing.toObject(), ...pricing }; 
        // Validate required fields for certain pricing types if necessary
        if ((newPricing.type === 'SUBSCRIPTION' || newPricing.type === 'PAY_PER_USE') && (newPricing.amount === null || newPricing.amount === undefined)) {
          // throw new UserInputError('Amount is required for SUBSCRIPTION or PAY_PER_USE pricing types.');
          // For now, let's be flexible, but this is a place for stricter validation
        }
        agentToUpdate.pricing = newPricing;
      }

      // Handle nested updates for integrationDetails
      if (integrationDetails) {
        // Create a new object for integrationDetails to ensure sub-document change detection
        const newIntegrationDetails = { ...agentToUpdate.integrationDetails.toObject(), ...integrationDetails };

        if (integrationDetails.authentication) {
          newIntegrationDetails.authentication = { 
            ...agentToUpdate.integrationDetails.authentication.toObject(), 
            ...integrationDetails.authentication 
          };
          if (integrationDetails.authentication.apiKeyDetails) {
            newIntegrationDetails.authentication.apiKeyDetails = {
              ...agentToUpdate.integrationDetails.authentication.apiKeyDetails.toObject(),
              ...integrationDetails.authentication.apiKeyDetails
            };
          }
          if (integrationDetails.authentication.bearerTokenDetails) {
            newIntegrationDetails.authentication.bearerTokenDetails = {
              ...agentToUpdate.integrationDetails.authentication.bearerTokenDetails.toObject(),
              ...integrationDetails.authentication.bearerTokenDetails
            };
          }
        }
        agentToUpdate.integrationDetails = newIntegrationDetails;
        // Potentially re-schedule vetting jobs if apiUrl or docUrl changes
        // For simplicity, this is omitted for now but is a good enhancement
      }

      // Nested SandboxDetails
      if (sandbox) { 
        agentToUpdate.sandbox = { ...agentToUpdate.sandbox.toObject(), ...sandbox };
      }

      await agentToUpdate.save();
      return agentToUpdate.populate('developer');
    },
    executeAgentSandboxTest: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to test an agent sandbox.');
      }

      const { agentId, inputData, method: rawMethod } = input;
      const httpMethod = rawMethod || 'POST'; // Default to POST

      let parsedInput = null;
      if (inputData) {
        try {
          parsedInput = JSON.parse(inputData);
        } catch (e) {
          return { success: false, response: null, error: 'Invalid JSON in inputData.' };
        }
      }

      try {
        // Fetch agent details, including authentication (already updated for this)
        const agent = await Agent.findById(agentId).select('+integrationDetails.apiUrl +integrationDetails.authentication +sandbox.isEnabled');

        if (!agent) {
          return { success: false, response: null, error: 'Agent not found.' };
        }
        if (!agent.sandbox || !agent.sandbox.isEnabled) {
          return { success: false, response: null, error: 'Sandbox is not enabled for this agent.' };
        }
        if (!agent.integrationDetails || !agent.integrationDetails.apiUrl) {
            return { success: false, response: null, error: 'Agent API URL is not configured.' };
        }

        // --- Real Test Execution for API Agents ---
        if (agent.integrationDetails.type === 'api') {
          try {
            let requestUrl = agent.integrationDetails.apiUrl;
            const requestConfig = {
              headers: { }, // Initialize with empty object, Content-Type added conditionally
              timeout: 15000, // 15 second timeout
            };

            // Apply authentication details (this logic should be mostly reusable)
            const authDetails = agent.integrationDetails.authentication;
            if (authDetails && authDetails.type !== 'NONE') {
              if (authDetails.type === 'API_KEY' && authDetails.apiKeyDetails) {
                const { key, in: apiKeyIn, name } = authDetails.apiKeyDetails;
                if (key && apiKeyIn && name) {
                  if (apiKeyIn === 'HEADER') {
                    requestConfig.headers[name] = key;
                  } else if (apiKeyIn === 'QUERY') {
                    // This will be appended later for GET, or now for POST if it's the only query source
                    // For GET, we collect all query params and append once.
                    // For POST, this is the primary way to add query params if needed.
                    if (httpMethod === 'POST') {
                        const separator = requestUrl.includes('?') ? '&' : '?';
                        requestUrl = `${requestUrl}${separator}${encodeURIComponent(name)}=${encodeURIComponent(key)}`;
                    }
                  }
                } else {
                  console.warn(`Agent ${agentId}: API_KEY auth details incomplete.`);
                }
              } else if (authDetails.type === 'BEARER_TOKEN' && authDetails.bearerTokenDetails) {
                const { token } = authDetails.bearerTokenDetails;
                if (token) {
                  requestConfig.headers['Authorization'] = `Bearer ${token}`;
                } else {
                  console.warn(`Agent ${agentId}: BEARER_TOKEN auth details incomplete (token missing).`);
                }
              } else if (authDetails.type !== 'NONE'){
                  console.warn(`Agent ${agentId}: Auth type set to ${authDetails.type} but details are missing/corrupt.`);
              }
            }

            let apiResponse;

            if (httpMethod === 'GET') {
              requestConfig.params = {}; // Axios uses 'params' for URL query parameters in GET requests

              // Add query parameters from inputData (if any)
              if (parsedInput && typeof parsedInput === 'object') {
                for (const key in parsedInput) {
                  if (Object.hasOwnProperty.call(parsedInput, key)) {
                    requestConfig.params[encodeURIComponent(key)] = encodeURIComponent(parsedInput[key]);
                  }
                }
              }

              // Add API key as query parameter if applicable for GET
              if (authDetails && authDetails.type === 'API_KEY' && authDetails.apiKeyDetails && authDetails.apiKeyDetails.in === 'QUERY') {
                const { key, name } = authDetails.apiKeyDetails;
                if (key && name) {
                    requestConfig.params[encodeURIComponent(name)] = encodeURIComponent(key);
                }
              }
              
              console.log(`Attempting GET API call to: ${requestUrl} for agent ${agentId} with config:`, JSON.stringify(requestConfig, null, 2));
              apiResponse = await axios.get(requestUrl, requestConfig);

            } else if (httpMethod === 'POST') {
              requestConfig.headers['Content-Type'] = 'application/json';
              console.log(`Attempting POST API call to: ${requestUrl} for agent ${agentId} with config:`, JSON.stringify(requestConfig, null, 2), 'and body:', parsedInput);
              apiResponse = await axios.post(
                requestUrl,
                parsedInput, // Send the parsed JSON object as the request body
                requestConfig
              );
            } else {
              return { success: false, response: null, error: `Unsupported HTTP method: ${httpMethod}` };
            }

            return {
              success: true,
              response: JSON.stringify(apiResponse.data), // apiResponse.data is the actual response from the agent's API
              error: null,
            };
          } catch (apiError) {
            console.error(`API call failed for agent ${agentId} to ${agent.integrationDetails.apiUrl}:`, apiError.message);
            let errorMessage = `Agent API call failed: ${apiError.message}`;
            if (apiError.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              errorMessage = `Agent API responded with status ${apiError.response.status}. Response: ${typeof apiError.response.data === 'object' ? JSON.stringify(apiError.response.data) : apiError.response.data}`;
            } else if (apiError.request) {
              // The request was made but no response was received
              errorMessage = 'Agent API call failed: No response received from the agent server.';
            }
            return {
              success: false,
              response: null,
              error: errorMessage,
            };
          }
        } else {
          // Handle agents that are not 'api' type or don't have an apiUrl configured for sandbox
          // For now, we can return a message indicating it's not supported, or fall back to a mock if desired.
          return {
            success: false,
            response: null,
            error: 'This agent is not configured for API-based sandbox testing or its API URL is missing.',
          };
        }
        // --- End Real Test Execution ---

      } catch (error) {
        console.error(`Error executing sandbox test for agent ${agentId}:`, error);
        return {
          success: false,
          response: null,
          error: `Failed to execute sandbox test: ${error.message}`,
        };
      }
    },
    createForumCategory: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a community.');
      }
      try {
        const newCategory = new ForumCategory({
          name: input.name,
          description: input.description,
          creator: context.user.id, // Assign the logged-in user as the creator
          // slug will be auto-generated by the pre-save hook in the model
        });
        console.log('!!!!!!!!!!!! RESOLVER: newCategory instance before save:', JSON.stringify(newCategory.toObject(), null, 2));
        if (newCategory.schema && newCategory.schema.s && newCategory.schema.s.hooks && typeof newCategory.schema.s.hooks.toString === 'function') {
          // Attempt to get a string representation of registered hooks
          // This accesses internal Mongoose structures and might vary between versions
          // For Mongoose 5.x/6.x, .hooks might be a Kareem instance. For 7.x+ it might be different.
          // Let's try to list the 'save' hooks specifically if possible.
          let presaveHooks = [];
          try {
            const presave = newCategory.schema.s.hooks.getHooks('save', { pres: true });
            if (presave && presave.length) {
              presaveHooks = presave.map(h => h.toString().substring(0,100) + '...'); // Get snippet of hook fn
            }
          } catch (e) { /* ignore if internal structure changed */ }
          console.log('!!!!!!!!!!!! RESOLVER: Hooks registered on newCategory.schema.s.hooks (presave):', presaveHooks.join(', '));
          console.log('!!!!!!!!!!!! RESOLVER: Full newCategory.schema.s.hooks object (if available):', newCategory.schema.s.hooks);
        } else {
          console.log('!!!!!!!!!!!! RESOLVER: newCategory.schema.s.hooks not found or accessible in expected structure.');
        }
        await newCategory.save(); // This is where the hook should fire
        
        // Populate the creator field to get the full User object
        await newCategory.populate('creator');
        
        // Use the serialization helper to properly convert MongoDB ObjectIds to strings
        const serialized = serializeDocument(newCategory);
        console.log('!!!!!!!!!!!! RESOLVER: Returning category with ID:', serialized.id, 'and Creator ID:', serialized.creator ? serialized.creator.id : 'null');
        return serialized;
      } catch (error) {
        console.error("Error creating forum category:", error);
        
        // Check for duplicate key error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
          throw new Error(`A community with the name "${input.name}" already exists. Please choose a different name.`);
        } else if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          throw new Error(`A community with a similar name already exists. Please choose a different name.`);
        } else {
          throw new Error(`Failed to create forum category: ${error.message}`);
        }
      }
    },
    updateForumCategory: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== 'admin') { // Ensure 'admin' is the correct role string
        throw new AuthenticationError('Not authorized to update forum categories. Only admins can perform this action.');
      }
      try {
        // 'input' should conform to UpdateForumCategoryInput, which ideally includes 'icon'
        const updatedCategory = await ForumCategory.findByIdAndUpdate(id, input, { new: true });
        if (!updatedCategory) {
          throw new Error('Forum category not found.');
        }
        return updatedCategory;
      } catch (error) {
        console.error("Error updating forum category:", error);
        throw new Error(`Failed to update forum category: ${error.message}`);
      }
    },
    deleteForumCategory: async (_, { id }, context) => {
      // Add authorization if needed
      // if (!context.user || context.user.role !== 'ADMIN') {
      //   throw new Error('Not authorized to delete forum categories.');
      // }
      try {
        const categoryToDelete = await ForumCategory.findByIdAndDelete(id);
        if (!categoryToDelete) {
          throw new Error('Forum category not found.');
        }
        // TODO: Handle posts associated with this category. For MVP, we might leave them orphaned
        // or prevent deletion if posts exist.
        await ForumPost.deleteMany({ category: id }); // Example: Deleting all posts in the category
        return categoryToDelete;
      } catch (error) {
        console.error("Error deleting forum category:", error);
        throw new Error(`Failed to delete forum category: ${error.message}`);
      }
    },

    createForumPost: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a post.');
      }
      try {
        const { categoryId: categoryIdentifier, ...postData } = input; // e.g. title, content, tags are in postData
        let actualCategoryId;

        if (!categoryIdentifier) {
          // This should ideally be caught by GraphQL schema if categoryId is non-nullable in CreateForumPostInput
          throw new UserInputError('Category identifier is required to create a post.');
        }

        // Check if categoryIdentifier is a slug (string, not a 24-char hex)
        if (typeof categoryIdentifier === 'string' && !categoryIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
          const categoryDoc = await ForumCategory.findOne({ slug: categoryIdentifier });
          if (!categoryDoc) {
            throw new UserInputError(`Category with slug "${categoryIdentifier}" not found.`);
          }
          actualCategoryId = categoryDoc._id;
        } else if (typeof categoryIdentifier === 'string' && categoryIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
          // It's an ObjectId string, verify it exists to be safe
          const categoryDoc = await ForumCategory.findById(categoryIdentifier);
          if (!categoryDoc) {
            throw new UserInputError(`Category with ID "${categoryIdentifier}" not found.`);
          }
          actualCategoryId = categoryIdentifier; // Mongoose can handle string ObjectIds
        } else {
          throw new UserInputError('Invalid category identifier format.');
        }

        const newPost = new ForumPost({
          ...postData, // Contains title, content, tags etc.
          category: actualCategoryId, // Use the resolved ObjectId
          author: context.user.id,
        });
        await newPost.save();
        
        // Increment postCount on the category using the resolved ObjectId
        await ForumCategory.findByIdAndUpdate(actualCategoryId, { $inc: { postCount: 1 } });

        return ForumPost.findById(newPost.id).populate('author').populate('category');
      } catch (error) {
        console.error("Error creating forum post:", error);
        // Consider UserInputError for validation issues
        throw new Error(`Failed to create forum post: ${error.message}`);
      }
    },
    updateForumPost: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update a post.');
      }
      try {
        const postToUpdate = await ForumPost.findById(id);
        if (!postToUpdate) {
          throw new Error('Forum post not found.');
        }
        // Check if the logged-in user is the author or an admin
        if (postToUpdate.author.toString() !== context.user.id && context.user.role !== 'ADMIN') {
          throw new AuthenticationError('You are not authorized to update this post.');
        }

        const updatedPost = await ForumPost.findByIdAndUpdate(id, input, { new: true })
          .populate('author')
          .populate('category');
        return updatedPost;
      } catch (error) {
        console.error("Error updating forum post:", error);
        throw new Error(`Failed to update forum post: ${error.message}`);
      }
    },
    deleteForumPost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a post.');
      }
      try {
        const postToDelete = await ForumPost.findById(id);
        if (!postToDelete) {
          throw new Error('Forum post not found.');
        }
        // Store categoryId before deleting the post
        const categoryId = postToDelete.category;

        if (postToDelete.author.toString() !== context.user.id && context.user.role !== 'ADMIN') {
          throw new AuthenticationError('You are not authorized to delete this post.');
        }

        // Start a session for transaction if your DB supports it and it's critical
        // For now, proceeding without explicit transaction for simplicity

        await ForumComment.deleteMany({ post: id }); // Delete associated comments
        await ForumPost.findByIdAndDelete(id);

        // Decrement postCount on the category
        if (categoryId) {
          await ForumCategory.findByIdAndUpdate(categoryId, { $inc: { postCount: -1 } });
        }

        return postToDelete; // Schema expects deleted post to be returned
      } catch (error) {
        console.error("Error deleting forum post:", error);
        // Consider more specific error handling or re-throwing for client
        throw new Error(`Failed to delete forum post: ${error.message}`);
      }
    },
    upvoteForumPost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to upvote a post.');
      }
      const userId = context.user.id;
      const post = await ForumPost.findById(id);

      if (!post) {
        throw new UserInputError('Forum post not found.');
      }

      const upvotedIndex = post.upvotedBy.indexOf(userId);
      const downvotedIndex = post.downvotedBy.indexOf(userId);

      if (upvotedIndex > -1) {
        post.upvotes -= 1;
        post.upvotedBy.splice(upvotedIndex, 1);
      } else {
        post.upvotes += 1;
        post.upvotedBy.push(userId);
        if (downvotedIndex > -1) {
          post.downvotes -= 1;
          post.downvotedBy.splice(downvotedIndex, 1);
        }
      }

      await post.save();
      return ForumPost.findById(post.id).populate('author').populate('category');
    },

    downvoteForumPost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to downvote a post.');
      }
      const userId = context.user.id;
      const post = await ForumPost.findById(id);

      if (!post) {
        throw new UserInputError('Forum post not found.');
      }

      const downvotedIndex = post.downvotedBy.indexOf(userId);
      const upvotedIndex = post.upvotedBy.indexOf(userId);

      if (downvotedIndex > -1) {
        post.downvotes -= 1;
        post.downvotedBy.splice(downvotedIndex, 1);
      } else {
        post.downvotes += 1;
        post.downvotedBy.push(userId);
        if (upvotedIndex > -1) {
          post.upvotes -= 1;
          post.upvotedBy.splice(upvotedIndex, 1);
        }
      }

      await post.save();
      return ForumPost.findById(post.id).populate('author').populate('category');
    },
    createForumComment: async (_, { input }, context) => {
          if (!context.user) {
        throw new AuthenticationError('You must be logged in to comment.');
      }
      const { postId, content } = input;
      try {
        const postExists = await ForumPost.findById(postId);
        if (!postExists) {
          throw new UserInputError('Post not found.');
        }
        if (postExists.isLocked) {
          throw new Error('This post is locked and does not accept new comments.');
        }

        const newComment = new ForumComment({
          post: postId,
          content,
          author: context.user.id,
        });
        await newComment.save();
        
        // Increment commentCount on the post
        postExists.commentCount = (postExists.commentCount || 0) + 1;
        await postExists.save();

        return ForumComment.findById(newComment.id).populate('author').populate('post');
      } catch (error) {
        console.error("Error creating forum comment:", error);
        // Consider using ApolloError for consistent error handling
        throw new Error(`Failed to create forum comment: ${error.message}`);
      }
    },

    updateForumComment: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update a comment.');
      }
      try {
        const commentToUpdate = await ForumComment.findById(id);
        if (!commentToUpdate) {
          throw new Error('Comment not found.');
        }
        if (commentToUpdate.author.toString() !== context.user.id && context.user.role !== 'ADMIN') {
          throw new AuthenticationError('You are not authorized to update this comment.');
        }

        // Only content can be updated as per UpdateForumCommentInput
        commentToUpdate.content = input.content;
        // commentToUpdate.isEdited = true; // If tracking edits
        await commentToUpdate.save();
        return ForumComment.findById(commentToUpdate.id).populate('author');
      } catch (error) {
        console.error("Error updating forum comment:", error);
        throw new Error(`Failed to update forum comment: ${error.message}`);
      }
    },
    deleteForumComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a comment.');
      }
      try {
        const commentToDelete = await ForumComment.findById(id);
        if (!commentToDelete) {
          throw new Error('Comment not found.');
        }
        if (commentToDelete.author.toString() !== context.user.id && context.user.role !== 'ADMIN') {
          throw new AuthenticationError('You are not authorized to delete this comment.');
        }
        await ForumComment.findByIdAndDelete(id);
        return commentToDelete; // Schema expects deleted comment to be returned
      } catch (error) {
        console.error("Error deleting forum comment:", error);
        throw new Error(`Failed to delete forum comment: ${error.message}`);
      }
    },
    upvoteForumComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to upvote a comment.');
      }
      const userId = context.user.id;
      const comment = await ForumComment.findById(id);

      if (!comment) {
        throw new UserInputError('Comment not found.');
      }

      const upvotedIndex = comment.upvotedBy.indexOf(userId);
      const downvotedIndex = comment.downvotedBy.indexOf(userId);

      if (upvotedIndex > -1) {
        // User has already upvoted, so remove upvote
        comment.upvotes -= 1;
        comment.upvotedBy.splice(upvotedIndex, 1);
      } else {
        // New upvote
        comment.upvotes += 1;
        comment.upvotedBy.push(userId);
        // If user had previously downvoted, remove downvote
        if (downvotedIndex > -1) {
          comment.downvotes -= 1;
          comment.downvotedBy.splice(downvotedIndex, 1);
        }
      }
      await comment.save();
      return ForumComment.findById(comment.id).populate('author').populate('post');
    },
    downvoteForumComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to downvote a comment.');
      }
      const userId = context.user.id;
      const comment = await ForumComment.findById(id);

      if (!comment) {
        throw new UserInputError('Comment not found.');
      }

      const downvotedIndex = comment.downvotedBy.indexOf(userId);
      const upvotedIndex = comment.upvotedBy.indexOf(userId);

      if (downvotedIndex > -1) {
        // User has already downvoted, so remove downvote
        comment.downvotes -= 1;
        comment.downvotedBy.splice(downvotedIndex, 1);
      } else {
        // New downvote
        comment.downvotes += 1;
        comment.downvotedBy.push(userId);
        // If user had previously upvoted, remove upvote
        if (upvotedIndex > -1) {
          comment.upvotes -= 1;
          comment.upvotedBy.splice(upvotedIndex, 1);
        }
      }

      await comment.save();
      return ForumComment.findById(comment.id).populate('author').populate('post');
    },
    updatePaymentMethod: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update payment details');
      }
      
      // In a real implementation, this would integrate with a payment processor
      // like Stripe, Braintree, etc.
      
      // Mock successful payment method update
      return {
        success: true,
        message: 'Payment method updated successfully',
        paymentMethod: {
          id: 'pm_' + Math.random().toString(36).substring(2, 15),
          type: 'card',
          lastFour: input.cardNumber.slice(-4),
          brand: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear
        }
      };
    },
    updateSubscription: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update your subscription');
      }
      
      const { planId, autoRenew } = input;
      
      // Get available plans
      const plans = [
        { id: 'basic', name: 'Basic', limits: { apiCalls: 5000 } },
        { id: 'pro', name: 'Professional', limits: { apiCalls: 25000 } },
        { id: 'business', name: 'Business', limits: { apiCalls: 100000 } }
      ];
      
      // Validate the plan exists
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new UserInputError('Invalid plan selected');
      }
      
      // In a real implementation, this would update the subscription in the database
      // and potentially communicate with a payment processor
      
      // For now, return a mock updated subscription
      return {
        id: `subscription_${user.id}`,
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: null,
        trialEndsAt: null,
        monthlyQuota: plan.limits.apiCalls,
        currentUsage: 0,
        autoRenew: autoRenew !== undefined ? autoRenew : true
      };
    },
    cancelSubscription: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to cancel your subscription');
      }
      
      // Try to find an existing subscription
      let subscription = await Subscription.findOne({ userId: user.id });
      
      // If no subscription exists, create a mock one for the purpose of cancellation
      if (!subscription) {
        const now = new Date();
        subscription = {
          id: `subscription_${user.id}`,
          userId: user.id,
          planId: 'pro',
          planName: 'Professional',
          status: 'active',
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: null,
          trialEndsAt: null,
          monthlyQuota: 25000,
          currentUsage: Math.floor(Math.random() * 10000),
          autoRenew: true
        };
      }
      
      // Return the updated subscription with canceled status
      return {
        ...subscription,
        status: 'canceled',
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() // End at the next billing cycle
      };
    },
    generateInvoice: async (_, { month, year }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to generate an invoice');
      }
      
      // Validate month and year
      if (month < 1 || month > 12) {
        throw new UserInputError('Invalid month specified');
      }
      
      if (year < 2020 || year > new Date().getFullYear()) {
        throw new UserInputError('Invalid year specified');
      }
      
      // Create a mock invoice for the specified month/year
      const invoiceDate = new Date(year, month - 1, 15); // Middle of the month
      
      return {
        id: `invoice_${user.id}_${month}_${year}`,
        invoiceNumber: `INV-${year}${month.toString().padStart(2, '0')}-${user.id.substring(0, 4)}`,
        userId: user.id,
        amount: 29.99,
        currency: 'USD',
        status: 'draft',
        dueDate: new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: null,
        items: [
          {
            description: `Professional Subscription - ${invoiceDate.toLocaleString('default', { month: 'long' })} ${year}`,
            amount: 29.99,
            quantity: 1
          }
        ],
        pdf: null, // Would be generated in a real implementation
        createdAt: new Date().toISOString()
      };
    },
    sendInterestEmail: async (_, { input }) => {
      try {
        const { name, email, company, interest, message } = input;
        
        // Admin notification email
        const adminEmailOptions = {
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          subject: 'New Interest Registration',
          html: `
            <h2>New Interest Registration</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Interest:</strong> ${interest}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          `
        };

        // Confirmation email to the user
        const userEmailOptions = {
          to: email,
          subject: 'Thank you for your interest in PigeonRTC',
          html: `
            <h2>Thank You for Your Interest!</h2>
            <p>Dear ${name},</p>
            <p>Thank you for expressing interest in PigeonRTC's ${interest} offering. We've received your message and our team will review it shortly.</p>
            <p>We're currently in the MVP phase and appreciate your early interest. As an early adopter, you'll receive special benefits when we launch.</p>
            <p>We'll be in touch soon with more information.</p>
            <p>Best regards,<br>The PigeonRTC Team</p>
          `
        };

        // Send emails
        await sendEmail(adminEmailOptions);
        await sendEmail(userEmailOptions);

        return {
          success: true,
          message: 'Your interest has been registered successfully. We will contact you soon!'
        };
      } catch (error) {
        console.error('Error sending interest email:', error);
        return {
          success: false,
          message: `Failed to register interest: ${error.message}`
        };
      }
    },

    updateUserProfile: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update your profile');
      }

      try {
        const { username, bio, company, avatarUrl } = input;
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { 
            ...(username && { username }),
            ...(bio !== undefined && { bio }),
            ...(company !== undefined && { company }),
            ...(avatarUrl && { avatarUrl })
          },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        return serializeDocument(updatedUser);
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw new ApolloError(`Failed to update profile: ${error.message}`, 'PROFILE_UPDATE_ERROR');
      }
    },

    changePassword: async (_, { currentPassword, newPassword }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to change your password');
      }

      try {
        // Find the user with the current password
        const userDoc = await User.findById(user.id);
        if (!userDoc) {
          throw new Error('User not found');
        }

        // Verify current password
        const isMatch = await userDoc.comparePassword(currentPassword);
        if (!isMatch) {
          throw new UserInputError('Current password is incorrect');
        }

        // Update password
        userDoc.password = newPassword;
        await userDoc.save();

        return true;
      } catch (error) {
        console.error('Error changing password:', error);
        throw new ApolloError(`Failed to change password: ${error.message}`, 'PASSWORD_CHANGE_ERROR');
      }
    },
    
    createReview: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a review');
      }
      
      try {
        const { agentId, rating, title, comment, useCase } = input;
        
        // Check if agent exists
        const agent = await Agent.findById(agentId);
        if (!agent) {
          throw new UserInputError('Agent not found');
        }
        
        // Check if user has already reviewed this agent
        const existingReview = await Review.findOne({ agent: agentId, user: user.id });
        if (existingReview) {
          throw new UserInputError('You have already reviewed this agent. Please update your existing review.');
        }
        
        // Create the review
        const review = new Review({
          agent: agentId,
          user: user.id,
          rating,
          title,
          comment,
          useCase,
          helpful: 0,
          notHelpful: 0
        });
        
        await review.save();
        
        // Update agent's average rating and review count
        await updateAgentReviewStats(agentId);
        
        return serializeDocument(review);
      } catch (error) {
        console.error('Error creating review:', error);
        throw new ApolloError(`Failed to create review: ${error.message}`, 'REVIEW_CREATE_ERROR');
      }
    },
    
    updateReview: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a review');
      }
      
      try {
        // Find the review
        const review = await Review.findById(id);
        if (!review) {
          throw new UserInputError('Review not found');
        }
        
        // Check if the user is the author of the review
        if (review.user.toString() !== user.id) {
          throw new AuthenticationError('You can only update your own reviews');
        }
        
        // Update the review
        const { rating, title, comment, useCase } = input;
        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;
        review.useCase = useCase !== undefined ? useCase : review.useCase;
        
        await review.save();
        
        // Update agent's average rating
        await updateAgentReviewStats(review.agent);
        
        return serializeDocument(review);
      } catch (error) {
        console.error('Error updating review:', error);
        throw new ApolloError(`Failed to update review: ${error.message}`, 'REVIEW_UPDATE_ERROR');
      }
    },
    
    deleteReview: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a review');
      }
      
      try {
        // Find the review
        const review = await Review.findById(id);
        if (!review) {
          throw new UserInputError('Review not found');
        }
        
        // Check if the user is the author of the review or an admin
        if (review.user.toString() !== user.id && user.role !== 'admin') {
          throw new AuthenticationError('You can only delete your own reviews');
        }
        
        const agentId = review.agent;
        
        // Delete the review
        await Review.findByIdAndDelete(id);
        
        // Update agent's average rating and review count
        await updateAgentReviewStats(agentId);
        
        return true;
      } catch (error) {
        console.error('Error deleting review:', error);
        throw new ApolloError(`Failed to delete review: ${error.message}`, 'REVIEW_DELETE_ERROR');
      }
    },
    
    markReviewHelpful: async (_, { id, helpful }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to mark a review as helpful');
      }
      
      try {
        // Find the review
        const review = await Review.findById(id);
        if (!review) {
          throw new UserInputError('Review not found');
        }
        
        // Check if the user has already voted on this review
        const existingVoteIndex = review.helpfulVotes.findIndex(
          vote => vote.user.toString() === user.id
        );
        
        if (existingVoteIndex !== -1) {
          // User has already voted, update their vote
          const existingVote = review.helpfulVotes[existingVoteIndex];
          
          // If the vote is the same, remove it (toggle off)
          if (existingVote.helpful === helpful) {
            // Decrement the appropriate counter
            if (helpful) {
              review.helpful = Math.max(0, review.helpful - 1);
            } else {
              review.notHelpful = Math.max(0, review.notHelpful - 1);
            }
            
            // Remove the vote
            review.helpfulVotes.splice(existingVoteIndex, 1);
          } else {
            // Vote changed, update counters
            if (helpful) {
              review.helpful += 1;
              review.notHelpful = Math.max(0, review.notHelpful - 1);
            } else {
              review.notHelpful += 1;
              review.helpful = Math.max(0, review.helpful - 1);
            }
            
            // Update the vote
            review.helpfulVotes[existingVoteIndex].helpful = helpful;
            review.helpfulVotes[existingVoteIndex].votedAt = new Date();
          }
        } else {
          // New vote
          if (helpful) {
            review.helpful += 1;
          } else {
            review.notHelpful += 1;
          }
          
          // Add the vote
          review.helpfulVotes.push({
            user: user.id,
            helpful,
            votedAt: new Date()
          });
        }
        
        await review.save();
        
        return serializeDocument(review);
      } catch (error) {
        console.error('Error marking review as helpful:', error);
        throw new ApolloError(`Failed to mark review as helpful: ${error.message}`, 'REVIEW_HELPFUL_ERROR');
      }
    },
  },
  ForumCategory: {
    postCount: async (parent) => {
      return ForumPost.countDocuments({ category: parent.id });
    },
  },
  ForumPost: {
    // author and category are populated by parent resolvers if .populate() is used.
    // If not, or if you need custom logic, you can define them here:
    // author: async (parent) => User.findById(parent.author),
    // category: async (parent) => ForumCategory.findById(parent.category),
    comments: async (parent, { limit = 10, offset = 0 }) => {
      try {
        const comments = await ForumComment.find({ post: parent.id })
          .sort({ createdAt: 1 }) // Oldest comments first, or -1 for newest
          .skip(offset)
          .limit(limit)
          .populate('author'); // Populate comment authors
      
        const totalCount = await ForumComment.countDocuments({ post: parent.id });

        return {
          comments,
          totalCount,
        };
      } catch (error) {
        console.error(`Error in ForumPost.comments resolver for post ${parent.id}:`, error);
        // Using ApolloError for better GraphQL error reporting
        throw new ApolloError(`Failed to fetch comments for post ${parent.id}. See server logs for details.`, "COMMENT_FETCH_ERROR");
        // Removed originalErrorMessage from client-facing error for brevity, server logs have full details.
      }
    },
    commentCount: async (parent) => {
      return ForumComment.countDocuments({ post: parent.id });
    },
  },
  // Review type resolvers
  Review: reviewResolvers.Review,
  ReviewConnection: reviewResolvers.ReviewConnection,
  
  ForumComment: {
    // author is typically populated by parent resolvers (e.g., in ForumPost.comments or createForumComment)
    // If direct fetching of a comment happens and author isn't populated, it can be resolved here:
    // author: async (parent) => User.findById(parent.author),
    // post: async (parent) => ForumPost.findById(parent.post), // If needed to resolve the parent post
  },
  
  // Type resolvers for billing related types
  Subscription: {
    user: async (parent) => {
      return await User.findById(parent.userId);
    },
    paymentMethod: async (parent) => {
      // In a real implementation, this would fetch payment details from the database
      // or payment processor API
      
      // Mock payment method
      return {
        id: `pm_${parent.userId}`,
        type: 'card',
        lastFour: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: new Date().getFullYear() + 1
      };
    }
  },
  Invoice: {
    user: async (parent) => {
      return await User.findById(parent.userId);
    }
  }
};

// Export the resolvers object
module.exports = resolvers;
