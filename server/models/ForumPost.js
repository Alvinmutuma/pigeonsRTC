const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumPostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String, // Consider using a more rich text format or markdown later
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming your user model is named 'User'
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ForumCategory',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  upvotes: { 
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: {
    type: Number,
    default: 0,
  },
  downvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // downvotes: { type: Number, default: 0 }, // Optional: if you want downvoting
  views: {
    type: Number,
    default: 0,
  },
  viewedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPinned: { // For moderators to pin important posts
    type: Boolean,
    default: false,
  },
  isLocked: { // For moderators to lock threads
    type: Boolean,
    default: false,
  },
  // We can add 'lastReplyAt' or 'lastReplyBy' later for sorting by recent activity
  // We can also add a 'commentCount' field later, denormalized for performance
}, { timestamps: true });

// Index for frequently queried fields
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ tags: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
