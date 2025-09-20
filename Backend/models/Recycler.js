const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const recyclerSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  OTP: {
    type: String
  },
  OTPExpiry: {
    type: Date
  },
  assignedEwaste: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ewaste'
  }],
  inspectionStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
recyclerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
recyclerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
recyclerSchema.methods.generateOTP = function() {
  this.OTP = Math.floor(100000 + Math.random() * 900000).toString();
  this.OTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return this.OTP;
};

const Recycler = mongoose.model('Recycler', recyclerSchema);

module.exports = Recycler;