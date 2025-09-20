// Get all e-waste inspection records directly from SchedulePickup where pickupStatus is 'Collected'
exports.getAllInspections = async (req, res) => {
  try {
    const SchedulePickup = require('../models/SchedulePickup');
    const pickups = await SchedulePickup.find({ pickupStatus: 'Collected' })
      .populate('userId', 'name email')
      .populate('assignedRecyclerId', 'ownerName companyName email');
    res.json({ success: true, count: pickups.length, data: pickups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching all inspections', error: error.message });
  }
};
const RecyclerPickup = require("../models/RecyclerPickup");
const SchedulePickup = require("../models/SchedulePickup");
const cloudinary = require('../config/cloudinary');
const saveUrlToBlockchain = require("../utils/blockchainUtils");
const User = require("../models/User");

// 1. Confirm Device Received (UNCHANGED)
exports.confirmReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    pickup.inspectionStatus = "Pending";
    await pickup.save();

    const newRecyclerPickup = new RecyclerPickup({
            pickupId: pickup._id,
            userId: pickup.userId,
            recyclerId: req.params.id, 
            inspectionStatus: "Under Inspection"
          });

    await newRecyclerPickup.save();

    // Optionally update SchedulePickup status too
    await SchedulePickup.findByIdAndUpdate(pickup.id, { pickupStatus: "Verified" });
    await pickup.save();


    res.json({ success: true, message: "Device approved! and pickup is scheduled", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error confirming device received", error: error.message });
  }
};

// 2. Inspect Device (ENHANCED with image upload support)
exports.inspectDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { physicalDamage, workingComponents, reusableSemiconductors, scrapValue, inspectionNotes } = req.body;

    // Handle uploaded files from Cloudinary
    const inspectionImages = [];
    const damageImages = [];

    if (req.files) {
      if (req.files.inspectionImages) {
        req.files.inspectionImages.forEach(file => inspectionImages.push(file.path));
      }
      if (req.files.damageImages) {
        req.files.damageImages.forEach(file => damageImages.push(file.path));
      }
    }

    const updateData = {
      "deviceConditionReport.physicalDamage": physicalDamage,
      "deviceConditionReport.workingComponents": workingComponents ? workingComponents.split(',') : [],
      "deviceConditionReport.reusableSemiconductors": reusableSemiconductors,
      "deviceConditionReport.scrapValue": scrapValue,
      inspectionNotes,
      inspectionStatus: "Under Inspection",
    };

    // Add images if uploaded
    if (inspectionImages.length > 0) {
      updateData["deviceConditionReport.inspectionImages"] = inspectionImages;
    }
    if (damageImages.length > 0) {
      updateData["deviceConditionReport.damageImages"] = damageImages;
    }


    const pickup = await RecyclerPickup.findByIdAndUpdate(id, updateData, { new: true });
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    // Always create a blockchain record for inspection
    let blockchainRecords = [];
    if (pickup.deviceConditionReport && pickup.deviceConditionReport.inspectionImages && pickup.deviceConditionReport.inspectionImages.length > 0) {
      for (const imageUrl of pickup.deviceConditionReport.inspectionImages) {
        const record = await saveUrlToBlockchain(pickup._id, imageUrl);
        blockchainRecords.push(record);
      }
    } else {
      // No images, create a blockchain record with a placeholder URL
      const placeholderUrl = `inspection-no-image-${pickup._id}`;
      const record = await saveUrlToBlockchain(pickup._id, placeholderUrl);
      blockchainRecords.push(record);
    }

    res.json({ success: true, message: "Inspection report updated", data: pickup, blockchainRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error inspecting device", error: error.message });
  }
};

// 3. Update Inspection Status (UNCHANGED)
exports.updateInspectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Under Inspection", "Completed"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const pickup = await RecyclerPickup.findByIdAndUpdate(id, { inspectionStatus: status }, { new: true });
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    res.json({ success: true, message: "Inspection status updated", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating inspection status", error: error.message });
  }
};

// 4. Propose Payment (UNCHANGED)
exports.proposePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposedPayment } = req.body;

    const pickup = await RecyclerPickup.findByIdAndUpdate(
      id,
      { proposedPayment, paymentStatus: "Pending" },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    res.json({ success: true, message: "Payment proposed to user", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error proposing payment", error: error.message });
  }
};

// 5. Finalize Payment (UNCHANGED)
exports.finalizePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalPayment } = req.body;

    const pickup = await RecyclerPickup.findByIdAndUpdate(
      id,
      { finalPayment, paymentStatus: "Approved" },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    // TODO: Call PaymentController to process payment
    res.json({ success: true, message: "Payment finalized", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error finalizing payment", error: error.message });
  }
};

// 6. Reject Device (UNCHANGED)
exports.rejectDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const pickup = await RecyclerPickup.findByIdAndUpdate(
      id,
      { paymentStatus: "Rejected", inspectionNotes: reason },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    res.json({ success: true, message: "Device rejected", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting device", error: error.message });
  }
};

// 7. Send Report to User (ENHANCED with document upload support)
exports.sendInspectionReport = async (req, res) => {
  try {
    const { id } = req.params;
    let pickup = await RecyclerPickup.findById(id).populate("userId", "name email");

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    // If a report document was uploaded, save its URL
    if (req.file) {
      pickup.inspectionReportDocument = req.file.path; // Cloudinary URL
      await pickup.save();
    }

    // TODO: integrate email/notification service
    res.json({
      success: true,
      message: "Inspection report ready (send via email/notification)",
      data: {
        ...pickup.deviceConditionReport,
        reportDocument: pickup.inspectionReportDocument
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending report", error: error.message });
  }
};

// 8. Get All Pickups for Recycler (UNCHANGED)
exports.getRecyclerPickups = async (req, res) => {
  try {
    const { recyclerId } = req.params;
    const pickups = await RecyclerPickup.find({ $or: [ { recyclerId }, { recyclerId: null } ] })
      .populate("pickupId")
      .populate("userId", "name email");

    res.json({ success: true, count: pickups.length, data: pickups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching recycler pickups", error: error.message });
  }
};

// NEW: Upload inspection images
exports.uploadInspectionImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const imageUrls = req.files.map(file => file.path); // Cloudinary URLs
    
    const pickup = await RecyclerPickup.findByIdAndUpdate(
      id,
      { $push: { "deviceConditionReport.inspectionImages": { $each: imageUrls } } },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    res.json({ 
      success: true, 
      message: "Images uploaded successfully", 
      data: { 
        uploadedImages: imageUrls,
        pickup 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error uploading images", error: error.message });
  }
};