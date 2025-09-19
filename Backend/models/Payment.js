const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  paymentId: {
    type: String,
    default: null,
    sparse: true, // Allows multiple null values
  },
  amount: {
    type: Number,
    required: true,
    min: 1, // Minimum amount in paise (1 paise)
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  // Additional metadata for recycling platform
  serviceType: {
    type: String,
    enum: ['pickup', 'premium_service', 'donation'],
    default: 'pickup',
  },
  deviceInfo: {
    type: String,
    default: null,
  },
  pickupAddress: {
    type: String,
    default: null,
  },
  failureReason: {
    type: String,
    default: null,
  },
  webhookProcessed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Compound index for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Instance methods
paymentSchema.methods.markAsSuccess = function(paymentId, signature) {
  this.status = 'success';
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.failureReason = null;
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason = 'Payment failed') {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Static methods
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId });
};

paymentSchema.statics.findUserPayments = function(userId, status = null) {
  const query = { userId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema);