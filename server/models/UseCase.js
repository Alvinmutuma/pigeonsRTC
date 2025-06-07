const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const useCaseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Use case title is required.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Use case description is required.'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required.'],
    trim: true
  },
  businessSize: {
    type: String,
    enum: ['SMALL', 'MEDIUM', 'ENTERPRISE', 'ALL'],
    default: 'ALL'
  },
  challenge: {
    type: String,
    required: [true, 'Business challenge is required.'],
    trim: true
  },
  solution: {
    type: String,
    required: [true, 'Solution description is required.'],
    trim: true
  },
  results: {
    type: String,
    required: [true, 'Results are required.'],
    trim: true
  },
  metrics: [{
    name: String,
    value: String,
    improvement: String
  }],
  testimonial: {
    quote: String,
    author: String,
    position: String,
    company: String
  },
  relatedAgents: [{
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  }],
  implementationSteps: [{
    order: Number,
    title: String,
    description: String
  }],
  mediaAssets: [{
    type: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
      required: true
    },
    url: String,
    title: String,
    description: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for searching
useCaseSchema.index({ 
  title: 'text', 
  description: 'text', 
  industry: 'text', 
  challenge: 'text', 
  solution: 'text',
  tags: 'text'
});

module.exports = mongoose.model('UseCase', useCaseSchema);
