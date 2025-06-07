const rateLimit = require('express-rate-limit');

// Rate limiting middleware for public endpoints
const publicLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// More restrictive rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.'
  }
});

// Rate limiting for API key based authentication
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5000, // Limit each API key to 5000 requests per hour
  keyGenerator: (req) => {
    // Get API key from header, query param, or body
    return req.headers['x-api-key'] || req.query.apiKey || (req.body && req.body.apiKey);
  },
  message: {
    success: false,
    error: 'API rate limit exceeded, please try again later.'
  }
});

module.exports = {
  publicLimiter,
  authLimiter,
  apiKeyLimiter
};
