const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Agent name is required.'],
    trim: true,
    unique: true // Assuming agent names should be unique for now
  },
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    ratingDistribution: [{
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      }
    }]
  },
  description: {
    type: String,
    required: [true, 'Agent description is required.'],
    trim: true
  },
  category: { // E.g., "Customer Support", "Marketing", "Data Analysis", "HR"
    type: String,
    required: [true, 'Category is required.'],
    trim: true
  },
  useCases: [{ // Specific tasks the agent can perform
    type: String,
    trim: true
  }],
  developer: { // Link to the User who created/owns this agent
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent must have a developer.']
  },
  collaborators: [{ // Git-style co-ownership - users who can edit the agent
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['ADMIN', 'EDITOR', 'VIEWER'],
      default: 'EDITOR'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  versionControl: {
    currentVersion: {
      type: String,
      default: '1.0.0'
    },
    versionHistory: [{
      version: String,
      description: String,
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      changes: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
      }]
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    forkCount: {
      type: Number,
      default: 0
    },
    forkedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Agent'
    }
  },
  status: {
    type: String,
    enum: ['pending_approval', 'active', 'inactive', 'rejected'],
    default: 'pending_approval',
    required: true
  },
  integrationDetails: {
    type: {
      type: String,
      enum: ['api', 'slack_plugin', 'website_widget', 'zapier', 'hubspot', 'notion', 'microsoft_teams', 'discord', 'salesforce', 'zendesk', 'custom'],
      required: [true, 'Integration type is required.']
    },
    apiUrl: { // Relevant if type is 'api'
      type: String,
      trim: true,
      // Conditional requirement could be added with custom validation if needed
    },
    externalDocumentationLink: { // New field for external documentation URL
      type: String,
      trim: true
    },
    instructions: { // General integration instructions
      type: String,
      trim: true
    },
    authentication: {
      type: { 
        type: String, 
        enum: ['NONE', 'API_KEY', 'BEARER_TOKEN', 'OAUTH2'], 
        default: 'NONE' 
      },
      apiKeyDetails: {
        key: { type: String, trim: true }, // The actual API key
        in: { type: String, enum: ['HEADER', 'QUERY'] }, // Where to put the key: 'HEADER' or 'QUERY'
        name: { type: String, trim: true }, // Header name (e.g., 'X-API-Key') or Query param name (e.g., 'apiKey')
      },
      bearerTokenDetails: {
        token: { type: String, trim: true } // The actual Bearer token
      },
      oauth2Details: {
        clientId: { type: String, trim: true },
        clientSecret: { type: String, trim: true },
        authorizationUrl: { type: String, trim: true },
        tokenUrl: { type: String, trim: true },
        redirectUri: { type: String, trim: true },
        scope: { type: String, trim: true }
      }
    },
    oneClickIntegrations: {
      slack: {
        enabled: { type: Boolean, default: false },
        botToken: { type: String, trim: true },
        signingSecret: { type: String, trim: true },
        installationUrl: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      hubspot: {
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, trim: true },
        portalId: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      notion: {
        enabled: { type: Boolean, default: false },
        accessToken: { type: String, trim: true },
        workspaceId: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      zapier: {
        enabled: { type: Boolean, default: false },
        webhookUrl: { type: String, trim: true },
        triggerKey: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      microsoft_teams: {
        enabled: { type: Boolean, default: false },
        appId: { type: String, trim: true },
        appPassword: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      salesforce: {
        enabled: { type: Boolean, default: false },
        consumerKey: { type: String, trim: true },
        consumerSecret: { type: String, trim: true },
        callbackUrl: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      zendesk: {
        enabled: { type: Boolean, default: false },
        subdomain: { type: String, trim: true },
        apiToken: { type: String, trim: true },
        configOptions: { type: Schema.Types.Mixed }
      },
      custom: {
        enabled: { type: Boolean, default: false },
        configOptions: { type: Schema.Types.Mixed }
      }
    }
  },
  sandbox: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    testInstructions: { // How businesses can test the agent in the sandbox
      type: String,
      trim: true
    },
    // demoUrl: String // Optional: Direct link to a live demo if separate from sandbox
  },
  customizationGuide: { // Text field for how businesses can customize (e.g., "Upload FAQs via API endpoint X")
    type: String,
    trim: true
  },
  defaultConfig: {
    type: Schema.Types.Mixed, // Allows for flexible JSON object for default configs
    default: {},
  },
  automatedVettingInfo: {
    apiUrlCheck: {
      lastChecked: Date,
      status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILURE', 'NOT_APPLICABLE', 'ERROR', 'QUEUED'],
        default: 'PENDING'
      },
      httpStatusCode: Number,
      details: String
    },
    docUrlCheck: {
      lastChecked: Date,
      status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILURE', 'NOT_APPLICABLE', 'ERROR', 'QUEUED'],
        default: 'PENDING'
      },
      httpStatusCode: Number,
      details: String
    }
    // Future automated checks can be added as sub-documents here
  },
  tags: [{ // For searchability and filtering
    type: String,
    trim: true
  }],
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    ratingDistribution: [{
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      }
    }]
  },
  pricing: {
    type: {
      type: String,
      enum: ['FREE', 'SUBSCRIPTION', 'PAY_PER_USE', 'CONTACT_SALES'],
      default: 'FREE',
      required: true
    },
    amount: { // e.g., monthly fee for subscription, or a reference price for pay-per-use
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD'
    },
    details: { // e.g., "$0.01/API call", "Includes 1000 calls/month", "Contact us for enterprise pricing"
      type: String,
      trim: true
    }
  },
  // submittedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Future: Link to User who submitted
  // approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Future: Link to Admin User who approved
  // approvedAt: Date, // Future
  
  // Review summary fields
  averageRating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Optional: Add an index for frequently searched fields
agentSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Agent', agentSchema);
