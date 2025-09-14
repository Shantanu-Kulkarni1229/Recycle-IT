const mongoose = require("mongoose");
const SchedulePickup = require("../models/SchedulePickup");
const { cloudinary } = require("../config/cloudinary");

// Validation function for ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to process uploaded files
const processUploadedFiles = (files) => {
  const result = {
    deviceImages: [],
    documents: []
  };

  if (!files) return result;

  // Handle different file upload scenarios
  let fileArray = [];
  
  if (Array.isArray(files)) {
    // files is an array (from upload.array())
    fileArray = files;
  } else if (files.deviceImages && Array.isArray(files.deviceImages)) {
    // files is an object with deviceImages array (from upload.fields())
    fileArray = [...fileArray, ...files.deviceImages];
  } else if (files.documents && Array.isArray(files.documents)) {
    // files is an object with documents array (from upload.fields())
    fileArray = [...fileArray, ...files.documents];
  } else if (files.deviceImages) {
    // Single file in deviceImages
    fileArray.push(files.deviceImages);
  } else if (files.documents) {
    // Single file in documents
    fileArray.push(files.documents);
  }

  fileArray.forEach(file => {
    const fileInfo = {
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      originalName: file.originalname,
      uploadedAt: new Date()
    };

    // Categorize based on file type
    if (file.mimetype.startsWith('image/')) {
      result.deviceImages.push(fileInfo);
    } else {
      result.documents.push({
        ...fileInfo,
        fileType: file.mimetype
      });
    }
  });

  return result;
};

// Helper function to delete files from Cloudinary
const deleteCloudinaryFiles = async (files) => {
  if (!files || files.length === 0) return;
  
  try {
    const deletePromises = files.map(file => 
      cloudinary.uploader.destroy(file.publicId)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting files from Cloudinary:", error);
  }
};

// 1. Create Pickup Request (UPDATED to handle file uploads)
exports.createPickup = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ["userId", "deviceType", "brand", "model", "condition", "pickupAddress", "city", "state", "pincode", "preferredPickupDate"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }
    
    // Validate userId format
    if (!isValidObjectId(req.body.userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    // Validate preferredPickupDate is in the future
    if (new Date(req.body.preferredPickupDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Preferred pickup date must be in the future"
      });
    }
    
    // Process uploaded files
    const uploadedFiles = processUploadedFiles(req.files);
    
    // Create pickup data
    const pickupData = {
      ...req.body,
      deviceImages: uploadedFiles.deviceImages,
      documents: uploadedFiles.documents
    };
    
    const newPickup = new SchedulePickup(pickupData);
    await newPickup.save();
    
    res.status(201).json({
      success: true,
      message: "Pickup request created successfully",
      data: newPickup,
      filesUploaded: {
        images: uploadedFiles.deviceImages.length,
        documents: uploadedFiles.documents.length
      }
    });
  } catch (error) {
    // If there was an error, clean up uploaded files
    if (req.files) {
      const uploadedFiles = processUploadedFiles(req.files);
      await deleteCloudinaryFiles([...uploadedFiles.deviceImages, ...uploadedFiles.documents]);
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors
      });
    }
    
    console.error("Error creating pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 2. Update Pickup Request (UPDATED to handle file uploads)
exports.updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    if (pickup.pickupStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Pickup cannot be updated after confirmation"
      });
    }
    
    // Prevent updating certain fields
    const restrictedFields = ["userId", "assignedRecyclerId", "assignedDeliveryAgentId", "pickupStatus"];
    restrictedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        delete req.body[field];
      }
    });
    
    // Process any new uploaded files
    const uploadedFiles = processUploadedFiles(req.files);
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // Add new files to existing ones (don't replace, append)
    if (uploadedFiles.deviceImages.length > 0) {
      updateData.$push = { 
        ...(updateData.$push || {}),
        deviceImages: { $each: uploadedFiles.deviceImages }
      };
    }
    
    if (uploadedFiles.documents.length > 0) {
      updateData.$push = { 
        ...(updateData.$push || {}),
        documents: { $each: uploadedFiles.documents }
      };
    }
    
    const updatedPickup = await SchedulePickup.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      message: "Pickup updated successfully",
      data: updatedPickup,
      filesUploaded: {
        images: uploadedFiles.deviceImages.length,
        documents: uploadedFiles.documents.length
      }
    });
  } catch (error) {
    // If there was an error, clean up uploaded files
    if (req.files) {
      const uploadedFiles = processUploadedFiles(req.files);
      await deleteCloudinaryFiles([...uploadedFiles.deviceImages, ...uploadedFiles.documents]);
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors
      });
    }
    
    console.error("Error updating pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 3. Cancel Pickup Request (SAME - no changes needed)
exports.cancelPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    if (["Collected", "Delivered", "Verified"].includes(pickup.pickupStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pickup with status: ${pickup.pickupStatus}`
      });
    }
    
    pickup.pickupStatus = "Cancelled";
    if (cancellationReason) {
      pickup.cancellationReason = cancellationReason;
    }
    
    await pickup.save();
    
    res.json({
      success: true,
      message: "Pickup cancelled successfully",
      data: pickup
    });
  } catch (error) {
    console.error("Error cancelling pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while cancelling pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 4. Get Pickup Details (SAME - no changes needed, will include new fields automatically)
exports.getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id)
      .populate("userId", "name email phone")
      .populate("assignedRecyclerId", "name contact address")
      .populate("assignedDeliveryAgentId", "name phone vehicleNumber");
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    res.json({
      success: true,
      data: pickup
    });
  } catch (error) {
    console.error("Error fetching pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 5. Get All User Pickups (SAME - no changes needed)
exports.getUserPickups = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    const query = { userId };
    if (status) {
      query.pickupStatus = status;
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "assignedRecyclerId", select: "name" },
        { path: "assignedDeliveryAgentId", select: "name" }
      ]
    };
    
    const pickups = await SchedulePickup.paginate(query, options);
    
    res.json({
      success: true,
      data: pickups.docs,
      pagination: {
        page: pickups.page,
        limit: pickups.limit,
        total: pickups.totalDocs,
        pages: pickups.totalPages,
        hasNext: pickups.hasNextPage,
        hasPrev: pickups.hasPrevPage
      }
    });
  } catch (error) {
    console.error("Error fetching user pickups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user pickups",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 6. Assign Recycler (SAME - no changes needed)
exports.assignRecycler = async (req, res) => {
  try {
    const { id } = req.params;
    const { recyclerId } = req.body;
    
    if (!isValidObjectId(id) || !isValidObjectId(recyclerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    const pickup = await SchedulePickup.findByIdAndUpdate(
      id,
      { 
        assignedRecyclerId: recyclerId, 
        pickupStatus: "Scheduled" 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate("assignedRecyclerId", "name contact");
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    res.json({
      success: true,
      message: "Recycler assigned successfully",
      data: pickup
    });
  } catch (error) {
    console.error("Error assigning recycler:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while assigning recycler",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 7. Assign Delivery Agent (SAME - no changes needed)
exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    
    if (!isValidObjectId(id) || !isValidObjectId(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    if (pickup.pickupStatus !== "Scheduled") {
      return res.status(400).json({
        success: false,
        message: "Delivery agent can only be assigned to scheduled pickups"
      });
    }
    
    pickup.assignedDeliveryAgentId = agentId;
    pickup.pickupStatus = "In Transit";
    await pickup.save();
    
    const updatedPickup = await SchedulePickup.findById(id)
      .populate("assignedDeliveryAgentId", "name phone");
    
    res.json({
      success: true,
      message: "Delivery agent assigned successfully",
      data: updatedPickup
    });
  } catch (error) {
    console.error("Error assigning delivery agent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while assigning delivery agent",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 8. Update Pickup Status (SAME - no changes needed)
exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const validStatuses = ["Pending", "Scheduled", "In Transit", "Collected", "Delivered", "Verified", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }
    
    const pickup = await SchedulePickup.findByIdAndUpdate(
      id, 
      { pickupStatus: status }, 
      { 
        new: true,
        runValidators: true 
      }
    );
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    res.json({
      success: true,
      message: "Pickup status updated successfully",
      data: pickup
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating status",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 9. Track Pickup (SAME - no changes needed)
exports.trackPickup = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id)
      .populate("assignedRecyclerId", "name location contact")
      .populate("assignedDeliveryAgentId", "name phone vehicleNumber")
      .populate("userId", "name phone");
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        status: pickup.pickupStatus,
        recycler: pickup.assignedRecyclerId,
        agent: pickup.assignedDeliveryAgentId,
        user: pickup.userId,
        estimatedPickupDate: pickup.preferredPickupDate,
        address: pickup.formattedAddress
      }
    });
  } catch (error) {
    console.error("Error tracking pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while tracking pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 10. Delete Pickup Request (UPDATED to clean up Cloudinary files)
exports.deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    if (!["Pending", "Cancelled"].includes(pickup.pickupStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or cancelled pickups can be deleted"
      });
    }
    
    // Delete associated files from Cloudinary before deleting the pickup
    const filesToDelete = [...pickup.deviceImages, ...pickup.documents];
    await deleteCloudinaryFiles(filesToDelete);
    
    await SchedulePickup.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: "Pickup deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting pickup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting pickup",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// NEW: Remove specific files from pickup (bonus utility function)
exports.removePickupFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileId, fileType } = req.body; // fileType: 'image' or 'document'
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    if (!fileId || !['image', 'document'].includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "File ID and valid file type (image/document) are required"
      });
    }
    
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }
    
    if (pickup.pickupStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Files cannot be removed after pickup confirmation"
      });
    }
    
    let fileToDelete = null;
    let updateQuery = {};
    
    if (fileType === 'image') {
      fileToDelete = pickup.deviceImages.find(img => img._id.toString() === fileId);
      updateQuery = { $pull: { deviceImages: { _id: fileId } } };
    } else {
      fileToDelete = pickup.documents.find(doc => doc._id.toString() === fileId);
      updateQuery = { $pull: { documents: { _id: fileId } } };
    }
    
    if (!fileToDelete) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(fileToDelete.publicId);
    
    // Remove from database
    await SchedulePickup.findByIdAndUpdate(id, updateQuery);
    
    res.json({
      success: true,
      message: "File removed successfully"
    });
  } catch (error) {
    console.error("Error removing file:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while removing file",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};