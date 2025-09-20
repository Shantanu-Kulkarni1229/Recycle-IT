const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema({
  // Partner Basic Information
  name: {
    type: String,
    required: [true, "Partner name is required"],
    trim: true,
    maxlength: [100, "Partner name cannot exceed 100 characters"]
  },
  
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: false, // Not globally unique, but unique per recycler
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
  },
  
  // Vehicle Information
  vehicleType: {
    type: String,
    required: [true, "Vehicle type is required"],
    enum: ["Bike", "Car", "Van", "Truck", "Pickup", "Auto"],
    default: "Bike"
  },
  
  vehicleNumber: {
    type: String,
    required: [true, "Vehicle number is required"],
    trim: true,
    uppercase: true,
    maxlength: [15, "Vehicle number cannot exceed 15 characters"]
  },
  
  // Service Areas
  serviceAreas: [{
    city: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"]
    }
  }],
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  workingHours: {
    start: {
      type: String,
      default: "09:00",
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"]
    },
    end: {
      type: String,
      default: "18:00",
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"]
    }
  },
  
  workingDays: {
    type: [String],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  
  // Associated Recycler
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recycler",
    required: [true, "Recycler ID is required"],
    index: true
  },
  
  // Performance Metrics
  totalPickups: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completedPickups: {
    type: Number,
    default: 0,
    min: 0
  },
  
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  
  // Status
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active"
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"],
    trim: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
deliveryPartnerSchema.index({ recyclerId: 1, email: 1 }, { unique: true });
deliveryPartnerSchema.index({ recyclerId: 1, phoneNumber: 1 });
deliveryPartnerSchema.index({ recyclerId: 1, status: 1, isAvailable: 1 });
deliveryPartnerSchema.index({ "serviceAreas.city": 1, "serviceAreas.pincode": 1 });

// Virtual for success rate
deliveryPartnerSchema.virtual('successRate').get(function() {
  if (this.totalPickups === 0) return 0;
  return Math.round((this.completedPickups / this.totalPickups) * 100);
});

// Virtual for full vehicle info
deliveryPartnerSchema.virtual('vehicleInfo').get(function() {
  return `${this.vehicleType} - ${this.vehicleNumber}`;
});

// Method to check if partner is available for a specific area
deliveryPartnerSchema.methods.isAvailableForArea = function(city, pincode) {
  if (!this.isAvailable || this.status !== 'Active') return false;
  
  return this.serviceAreas.some(area => 
    area.city.toLowerCase() === city.toLowerCase() && 
    area.pincode === pincode
  );
};

// Method to check if partner is available at current time
deliveryPartnerSchema.methods.isAvailableNow = function() {
  if (!this.isAvailable || this.status !== 'Active') return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check if today is a working day
  if (!this.workingDays.includes(currentDay)) return false;
  
  // Check if current time is within working hours
  return currentTime >= this.workingHours.start && currentTime <= this.workingHours.end;
};

// Static method to find available partners for an area
deliveryPartnerSchema.statics.findAvailableForArea = function(recyclerId, city, pincode) {
  return this.find({
    recyclerId,
    isAvailable: true,
    status: 'Active',
    'serviceAreas.city': new RegExp(city, 'i'),
    'serviceAreas.pincode': pincode
  });
};

// Pre-save middleware to update timestamps
deliveryPartnerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to format phone number
deliveryPartnerSchema.pre('save', function(next) {
  if (this.phoneNumber) {
    // Remove any non-digit characters
    this.phoneNumber = this.phoneNumber.replace(/\D/g, '');
  }
  next();
});

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);