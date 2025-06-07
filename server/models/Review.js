const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: [true, 'Agent reference is required'],
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author reference is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    maxlength: 5000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  helpfulVoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Add indexes for common queries
reviewSchema.index({ agent: 1, author: 1 }, { unique: true }); // One review per agent per user
reviewSchema.index({ agent: 1, rating: 1 }); // For filtering by rating
reviewSchema.index({ agent: 1, createdAt: -1 }); // For sorting by date
reviewSchema.index({ status: 1, createdAt: -1 }); // For admin review queue

// Middleware to update agent's review statistics when a review is saved
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'APPROVED') {
    await updateAgentReviewStats(doc.agent);
  }
});

// Middleware to update agent's review statistics when a review is removed
reviewSchema.post('remove', async function(doc) {
  if (doc.status === 'APPROVED') {
    await updateAgentReviewStats(doc.agent);
  }
});

// Static method to get rating distribution for an agent
reviewSchema.statics.getRatingDistribution = async function(agentId) {
  const result = await this.aggregate([
    { $match: { agent: agentId, status: 'APPROVED' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  // Convert to the expected format
  return result.map(item => ({
    rating: item._id,
    count: item.count
  }));
};

// Static method to get average rating for an agent
reviewSchema.statics.getAverageRating = async function(agentId) {
  const result = await this.aggregate([
    { $match: { agent: agentId, status: 'APPROVED' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 
    ? { average: parseFloat(result[0].avg.toFixed(2)), count: result[0].count }
    : { average: 0, count: 0 };
};

// Helper function to update agent's review statistics
async function updateAgentReviewStats(agentId) {
  const Review = mongoose.model('Review');
  const Agent = mongoose.model('Agent');
  
  const [ratingStats, reviewCount] = await Promise.all([
    Review.getAverageRating(agentId),
    Review.countDocuments({ agent: agentId, status: 'APPROVED' })
  ]);
  
  await Agent.findByIdAndUpdate(agentId, {
    $set: {
      'reviews.averageRating': ratingStats.average,
      'reviews.count': reviewCount
    }
  });
}

// Method to check if a user can review an agent (has used the agent)
reviewSchema.statics.canUserReview = async function(agentId, userId) {
  // In a real app, implement logic to check if the user has used the agent
  // For now, we'll just check if they haven't reviewed it yet
  const existingReview = await this.findOne({ agent: agentId, author: userId });
  return !existingReview;
};

// Method to mark a review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (this.helpfulVoters.includes(userId)) {
    throw new Error('You have already voted on this review');
  }
  
  this.helpfulVotes += 1;
  this.helpfulVoters.push(userId);
  return this.save();
};

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are included in toJSON output
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);
