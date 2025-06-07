const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const forumCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

forumCategorySchema.pre('validate', function(next) {
  if (this.name && (this.isNew || this.isModified('name'))) {
    try {
      const generatedSlug = slugify(this.name, { lower: true, strict: true });
      this.slug = generatedSlug;
    } catch (e) {
      console.error('Error during slug generation:', e);
      // If slugify fails, the slug might remain unset, leading to validation error.
      // We could call next(e) here to propagate the error immediately, 
      // or let it proceed and fail validation (current behavior).
    }
  }
  next();
});

// Check if the model is already compiled, if not, compile it.
// This can sometimes help with issues related to hot-reloading or multiple requires.
const ForumCategory = mongoose.models.ForumCategory || mongoose.model('ForumCategory', forumCategorySchema);
module.exports = ForumCategory;
