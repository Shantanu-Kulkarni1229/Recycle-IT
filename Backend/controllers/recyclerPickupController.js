const RecyclerPickup = require("../models/RecyclerPickup");
const SchedulePickup = require("../models/SchedulePickup");
const cloudinary = require('../config/cloudinary');

// 1. Confirm Device Received (UNCHANGED)
exports.confirmReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id);

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    pickup.inspectionStatus = "Pending";
    await pickup.save();

    // Optionally update SchedulePickup status too
    await SchedulePickup.findByIdAndUpdate(pickup.id, { pickupStatus: "Approved" });
    await pickup.save();

    res.json({ success: true, message: "Device received at recycler center", data: pickup });
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
      // If files were uploaded, get their Cloudinary URLs
      req.files.forEach(file => {
        if (file.fieldname === 'inspectionImages') {
          inspectionImages.push(file.path); // Cloudinary URL
        } else if (file.fieldname === 'damageImages') {
          damageImages.push(file.path); // Cloudinary URL
        }
      });
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

    res.json({ success: true, message: "Inspection report updated", data: pickup });
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
    const pickups = await RecyclerPickup.find({ recyclerId })
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