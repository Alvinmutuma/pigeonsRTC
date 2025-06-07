const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// For tracking individual API calls/usage
const UsageRecordSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  requestSize: {
    type: Number,
    default: 1 // Represents tokens or units consumed
  },
  responseSize: {
    type: Number,
    default: 1
  },
  endpoint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'rate_limited'],
    default: 'success'
  },
  latency: {
    type: Number // in ms
  }
});

// For tracking subscription plans and current status
const SubscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'unpaid'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  trialEndsAt: {
    type: Date
  },
  monthlyQuota: {
    type: Number,
    default: 0
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  paymentDetails: {
    lastFour: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  autoRenew: {
    type: Boolean,
    default: true
  }
});

// For tracking invoices and payments
const InvoiceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'paid', 'uncollectible', 'void'],
    default: 'draft'
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  invoiceNumber: {
    type: String
  },
  items: [{
    description: String,
    amount: Number,
    quantity: Number
  }],
  pdf: String, // URL to PDF
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UsageRecord = mongoose.model('UsageRecord', UsageRecordSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = { UsageRecord, Subscription, Invoice };
