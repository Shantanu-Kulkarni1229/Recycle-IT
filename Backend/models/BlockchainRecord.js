const mongoose = require('mongoose');
const crypto = require('crypto');

const blockchainSchema = new mongoose.Schema({
  pickupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchedulePickup',
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  previousHash: {
    type: String,
    default: 'GENESIS'
  },
  hash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Method to generate a SHA256 hash
blockchainSchema.methods.generateHash = function () {
  const data = `${this.pickupId}${this.cloudinaryUrl}${this.previousHash}${this.timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

const BlockchainRecord = mongoose.model('BlockchainRecord', blockchainSchema);
module.exports = BlockchainRecord;
