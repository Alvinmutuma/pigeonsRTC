const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address.',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [8, 'Password must be at least 8 characters long.'], // Increased from 6 to 8
    // Password complexity validation happens in pre-save hook
  },
  role: {
    type: String,
    enum: ['business_user', 'developer', 'admin'],
    default: 'business_user',
  },
  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationExpires: {
    type: Date,
  },
  // Password reset
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  // Role-based dashboard path
  dashboardPath: {
    type: String,
  },
  // Login security
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  // You might want to add fields like:
  // companyName: String,
  // profilePicture: String,
  // agentsDeveloped: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  // subscribedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Pre-save hook to validate password complexity and hash password before saving
userSchema.pre('save', async function (next) {
  // Only validate and hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Set dashboard path based on role
  if (this.isNew || this.isModified('role')) {
    if (this.role === 'developer') {
      this.dashboardPath = '/developer-dashboard';
    } else if (this.role === 'business_user') {
      this.dashboardPath = '/business-dashboard';
    } else if (this.role === 'admin') {
      this.dashboardPath = '/admin/dashboard';
    }
  }

  // Password complexity validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>#])[A-Za-z\d!@#$%^&*(),.?":{}|<>#]{8,}$/;
  
  if (!passwordRegex.test(this.password)) {
    return next(new Error('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'));
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
