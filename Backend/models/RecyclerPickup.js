const mongoose = require("mongoose");

const recyclerPickupSchema = new mongoose.Schema(
  {
    pickupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchedulePickup",
      required: true,
    },
    recyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recycler",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceConditionReport: {
      physicalDamage: { type: Number, default: 0 }, // %
      workingComponents: [{ type: String }], // ["screen", "battery", "motherboard"]
      reusableSemiconductors: { type: Number, default: 0 },
      scrapValue: { type: Number, default: 0 },
      // NEW: Add image fields for inspection photos
      inspectionImages: [{ type: String }], // Array of Cloudinary URLs
      damageImages: [{ type: String }], // Array of Cloudinary URLs for damage photos
    },

    inspectionStatus: {
      type: String,
      enum: ["Pending", "Under Inspection", "Completed"],
      default: "Pending",
    },

    proposedPayment: { type: Number, default: 0 },
    finalPayment: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Approved", "Paid", "Rejected"],
      default: "Pending",
    },
    aggreementSigned: { type: Boolean, default: false },
    inspectionNotes: { type: String },
    
    // NEW: Add inspection report document field
    inspectionReportDocument: { type: String }, // Cloudinary URL for PDF report
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecyclerPickup", recyclerPickupSchema);