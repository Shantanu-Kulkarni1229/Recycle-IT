const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const schedulePickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    deviceType: { 
      type: String, 
      required: [true, "Device type is required"],
      trim: true
    },
    brand: { 
      type: String, 
      required: [true, "Brand is required"],
      trim: true
    },
    model: { 
      type: String, 
      required: [true, "Model is required"],
      trim: true
    },
    purchaseDate: { 
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value <= new Date();
        },
        message: "Purchase date cannot be in the future"
      }
    },
    timeSincePurchase: { 
      type: String,
      trim: true
    },
    condition: {
      type: String,
      enum: {
        values: ["Working", "Partially Working", "Not Working", "Scrap"],
        message: "Condition must be one of: Working, Partially Working, Not Working, Scrap"
      },
      required: [true, "Device condition is required"]
    },
    weight: { 
      type: Number,
      min: [0, "Weight cannot be negative"]
    },
    notes: { 
      type: String,
      trim: true,
      maxLength: [500, "Notes cannot exceed 500 characters"]
    },
    // NEW: Device images uploaded to Cloudinary
    deviceImages: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      },
      originalName: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // NEW: Documents (receipts, warranties, etc.)
    documents: [{
      url: {
        type: String,
        // required: true
      },
      publicId: {
        type: String,
        required: true
      },
      originalName: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    pickupAddress: { 
      type: String, 
      required: [true, "Pickup address is required"],
      trim: true
    },
    city: { 
      type: String, 
      required: [true, "City is required"],
      trim: true
    },
    state: { 
      type: String, 
      required: [true, "State is required"],
      trim: true
    },
    pincode: { 
      type: String, 
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"]
    },
    preferredPickupDate: { 
      type: Date, 
      required: [true, "Preferred pickup date is required"],
      validate: {
        validator: function(value) {
          return value >= new Date();
        },
        message: "Preferred pickup date must be in the future"
      }
    },
    pickupStatus: {
      type: String,
      enum: {
        values: ["Pending", "Scheduled", "In Transit", "Collected", "Delivered", "Verified", "Cancelled"],
        message: "Status must be one of: Pending, Scheduled, In Transit, Collected, Delivered, Verified, Cancelled"
      },
      default: "Pending"
    },
    assignedRecyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recycler",
    },
    assignedDeliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },
    assignedDeliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxLength: [200, "Cancellation reason cannot exceed 200 characters"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

schedulePickupSchema.plugin(mongoosePaginate);

// Virtual for formatted address
schedulePickupSchema.virtual("formattedAddress").get(function() {
  return `${this.pickupAddress}, ${this.city}, ${this.state} - ${this.pincode}`;
});

// Index for better query performance
schedulePickupSchema.index({ userId: 1, createdAt: -1 });
schedulePickupSchema.index({ pickupStatus: 1 });
schedulePickupSchema.index({ preferredPickupDate: 1 });

// Pre-save middleware to calculate timeSincePurchase if purchaseDate is provided
schedulePickupSchema.pre("save", function(next) {
  if (this.purchaseDate && !this.timeSincePurchase) {
    const now = new Date();
    const purchaseDate = new Date(this.purchaseDate);
    const diffTime = Math.abs(now - purchaseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      this.timeSincePurchase = `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      this.timeSincePurchase = `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      this.timeSincePurchase = `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  }
  next();
});

module.exports = mongoose.model("SchedulePickup", schedulePickupSchema);