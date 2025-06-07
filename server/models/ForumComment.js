const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumCommentSchema = new Schema({
  post: { // The parent post this comment belongs to
    type: Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true,
    index: true, // Index for quick retrieval of comments for a post
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming your user model is named 'User'
    required: true,
  },
  content: {
    type: String, // Consider rich text/markdown later
    required: true,
  },
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
  // parentComment: { // For threaded replies, if we add them later
  //   type: Schema.Types.ObjectId,
  //   ref: 'ForumComment',
  //   default: null,
  // },
  // isEdited: { type: Boolean, default: false }, // Optional
}, { timestamps: true });

// Index for retrieving comments by a specific user
forumCommentSchema.index({ author: 1 });

// Optional: Compound index for fetching comments for a post, sorted by creation time
forumCommentSchema.index({ post: 1, createdAt: 1 });


module.exports = mongoose.model('ForumComment', forumCommentSchema);
