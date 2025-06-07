const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');
const Review = require('../../models/Review');
const Agent = require('../../models/Agent');

const reviewResolvers = {
  Query: {
    // Get reviews for a specific agent
    agentReviews: async (_, { agentId, sortBy = 'NEWEST' }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('You must be logged in to view reviews');
        }

        // Check if agent exists
        const agent = await Agent.findById(agentId);
        if (!agent) {
          throw new UserInputError('Agent not found');
        }

        // Build query
        const query = { agent: agentId, status: 'APPROVED' };

        // Build sort
        let sort = {};
        switch (sortBy) {
          case 'NEWEST':
            sort = { createdAt: -1 };
            break;
          case 'HELPFUL':
            sort = { helpfulVotes: -1, createdAt: -1 };
            break;
          case 'HIGHEST_RATING':
            sort = { rating: -1, createdAt: -1 };
            break;
          case 'LOWEST_RATING':
            sort = { rating: 1, createdAt: -1 };
            break;
          default:
            sort = { createdAt: -1 };
        }

        // Get reviews with pagination
        const reviews = await Review.find(query)
          .sort(sort)
          .populate('author', 'username avatar')
          .lean();

        // Check if current user has marked reviews as helpful
        if (user) {
          const userReviews = await Review.find({
            _id: { $in: reviews.map(r => r._id) },
            helpfulVoters: user.id
          });
          
          const helpfulReviewIds = userReviews.map(r => r._id.toString());
          
          // Add isHelpful flag to reviews
          reviews.forEach(review => {
            review.isHelpful = helpfulReviewIds.includes(review._id.toString());
          });
        }

        // Get average rating and rating distribution
        const [averageRating, ratingDistribution] = await Promise.all([
          Review.aggregate([
            { $match: { agent: agentId, status: 'APPROVED' } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
          ]),
          Review.aggregate([
            { $match: { agent: agentId, status: 'APPROVED' } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
          ])
        ]);

        const total = ratingDistribution.reduce((sum, item) => sum + item.count, 0);
        
        const distributionWithPercentage = ratingDistribution.map(item => ({
          rating: item._id,
          count: item.count,
          percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
        }));

        return {
          reviews,
          totalCount: reviews.length,
          averageRating: averageRating.length > 0 ? parseFloat(averageRating[0].avg.toFixed(2)) : 0,
          ratingDistribution: distributionWithPercentage
        };
      } catch (error) {
        console.error('Error fetching agent reviews:', error);
        throw error;
      }
    },

    // Get current user's reviews
    myReviews: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view your reviews');
      }

      try {
        const reviews = await Review.find({ author: user.id })
          .populate('agent', 'name')
          .sort({ createdAt: -1 });
        
        return reviews;
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw new Error('Error fetching your reviews');
      }
    },

    // Get current user's review for a specific agent
    userReviewForAgent: async (_, { agentId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view your review');
      }

      try {
        const review = await Review.findOne({
          agent: agentId,
          author: user.id
        });

        return review;
      } catch (error) {
        console.error('Error fetching user review for agent:', error);
        throw new Error('Error fetching your review');
      }
    },

    // Get pending reviews (admin only)
    pendingReviews: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Not authorized to view pending reviews');
      }

      try {
        const reviews = await Review.find({ status: 'PENDING' })
          .populate('agent', 'name')
          .populate('author', 'username')
          .sort({ createdAt: 1 });
        
        return reviews;
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        throw new Error('Error fetching pending reviews');
      }
    }
  },

  Mutation: {
    // Create or update a review
    createReview: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to leave a review');
      }

      try {
        const { agentId, rating, title, content, pros, cons, verifiedPurchase } = input;

        // Check if agent exists
        const agent = await Agent.findById(agentId);
        if (!agent) {
          throw new UserInputError('Agent not found');
        }

        // Check if user has already reviewed this agent
        let review = await Review.findOne({
          agent: agentId,
          author: user.id
        });

        const reviewData = {
          agent: agentId,
          author: user.id,
          rating,
          title,
          content,
          pros: pros || [],
          cons: cons || [],
          verifiedPurchase: !!verifiedPurchase,
          status: 'PENDING' // Default status, can be changed based on your moderation flow
        };

        if (review) {
          // Update existing review
          review = await Review.findByIdAndUpdate(
            review._id,
            { $set: reviewData },
            { new: true }
          );
        } else {
          // Create new review
          review = new Review(reviewData);
          await review.save();
        }
        // Update agent's review statistics
        await Review.updateAgentReviewStats(agentId);

        return review.populate('author', 'username avatar');
      } catch (error) {
        console.error('Error creating/updating review:', error);
        throw new Error('Error saving your review');
      }
    },

    // Mark a review as helpful
    markReviewHelpful: async (_, { id, helpful }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to rate reviews');
      }

      try {
        const review = await Review.findById(id);
        if (!review) {
          throw new UserInputError('Review not found');
        }

        // Check if user has already voted
        const hasVoted = review.helpfulVoters.some(voterId => 
          voterId.toString() === user.id
        );

        if (hasVoted) {
          throw new UserInputError('You have already rated this review');
        }

        // Update helpful votes
        review.helpfulVotes += helpful ? 1 : 0;
        review.helpfulVoters.push(user.id);
        
        await review.save();
        
        return review;
      } catch (error) {
        console.error('Error marking review helpful:', error);
        throw new Error('Error updating review rating');
      }
    },

    // Admin: Update review status (approve/reject)
    updateReviewStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Not authorized to update review status');
      }

      try {
        const review = await Review.findByIdAndUpdate(
          id,
          { $set: { status } },
          { new: true }
        ).populate('agent', 'name');

        if (!review) {
          throw new UserInputError('Review not found');
        }

        // Update agent's review statistics
        await Review.updateAgentReviewStats(review.agent._id);

        return review;
      } catch (error) {
        console.error('Error updating review status:', error);
        throw new Error('Error updating review status');
      }
    },

    // Delete a review (admin or review author)
    deleteReview: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a review');
      }

      try {
        const review = await Review.findById(id);
        if (!review) {
          throw new UserInputError('Review not found');
        }

        // Check if user is admin or review author
        if (user.role !== 'admin' && review.author.toString() !== user.id) {
          throw new ForbiddenError('Not authorized to delete this review');
        }

        const agentId = review.agent;
        await review.remove();

        // Update agent's review statistics
        await Review.updateAgentReviewStats(agentId);

        return true;
      } catch (error) {
        console.error('Error deleting review:', error);
        throw new Error('Error deleting review');
      }
    }
  },

  // Resolver for the Review type
  Review: {
    // Resolve the author field
    author: async (review, _, { loaders }) => {
      // Using dataloader for batch loading users
      return loaders.user.load(review.author);
    },
    
    // Resolve the agent field
    agent: async (review, _, { loaders }) => {
      // Using dataloader for batch loading agents
      return loaders.agent.load(review.agent);
    },
    
    // Format the date
    formattedDate: (review) => {
      return new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    // Check if current user has marked this review as helpful
    isHelpful: (review, _, { user }) => {
      if (!user) return false;
      return review.helpfulVoters.some(voterId => 
        voterId.toString() === user.id
      );
    }
  },
  
  // Resolver for the ReviewConnection type
  ReviewConnection: {
    // Calculate total count
    totalCount: (reviewConnection) => {
      return reviewConnection.reviews ? reviewConnection.reviews.length : 0;
    },
    
    // Calculate average rating
    averageRating: (reviewConnection) => {
      if (!reviewConnection.reviews || reviewConnection.reviews.length === 0) {
        return 0;
      }
      
      const sum = reviewConnection.reviews.reduce(
        (total, review) => total + (review.rating || 0),
        0
      );
      
      return parseFloat((sum / reviewConnection.reviews.length).toFixed(2));
    },
    
    // Calculate rating distribution
    ratingDistribution: (reviewConnection) => {
      if (!reviewConnection.reviews || reviewConnection.reviews.length === 0) {
        return [];
      }
      
      const distribution = {};
      const total = reviewConnection.reviews.length;
      
      // Initialize distribution
      for (let i = 1; i <= 5; i++) {
        distribution[i] = 0;
      }
      
      // Count ratings
      reviewConnection.reviews.forEach(review => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });
      
      // Convert to array of objects
      return Object.entries(distribution)
        .map(([rating, count]) => ({
          rating: parseInt(rating),
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.rating - a.rating);
    }
  }
};

module.exports = reviewResolvers;
