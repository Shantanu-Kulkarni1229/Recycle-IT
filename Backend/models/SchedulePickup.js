// models/SchedulePickup.js
const mongoose = require("mongoose");

const schedulePickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceType: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    purchaseDate: { type: Date },
    timeSincePurchase: { type: String },

    condition: {
      type: String,
      enum: ["Working", "Partially Working", "Not Working", "Scrap"],
      required: true,
    },
    weight: { type: Number },
    notes: { type: String },

    pickupAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    preferredPickupDate: { type: Date, required: true },
    pickupStatus: {
      type: String,
      enum: ["Pending", "Scheduled", "In Transit", "Collected", "Delivered", "Verified", "Cancelled"],
      default: "Pending",
    },

    assignedRecyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recycler",
    },
    assignedDeliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchedulePickup", schedulePickupSchema);
