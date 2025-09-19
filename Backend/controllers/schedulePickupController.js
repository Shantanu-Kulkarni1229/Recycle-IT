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

    // Get current pickup with user details before updating
    const currentPickup = await SchedulePickup.findById(id).populate('userId', 'firstName lastName email phoneNumber');
    
    if (!currentPickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }

    // Update the pickup status
    const pickup = await SchedulePickup.findByIdAndUpdate(
      id, 
      { 
        pickupStatus: status,
        updatedAt: new Date()
      }, 
      { 
        new: true,
        runValidators: true 
      }
    ).populate('userId', 'firstName lastName email phoneNumber');

    // Send notification based on status change
    try {
      await sendPickupStatusNotification(pickup, status);
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: "Pickup status updated successfully",
      data: pickup,
      notification: "Status update notification sent to user"
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

// Helper function to send pickup status notifications
async function sendPickupStatusNotification(pickup, newStatus) {
  if (!pickup.userId || !pickup.userId.email) {
    console.log("No user email found for notification");
    return;
  }

  const { sendEmail } = require("../utils/emailService");
  
  let subject = '';
  let emailBody = '';
  
  const userName = `${pickup.userId.firstName} ${pickup.userId.lastName}`;
  const deviceInfo = `${pickup.brand} ${pickup.model} (${pickup.deviceType})`;
  
  switch (newStatus) {
    case 'Scheduled':
      subject = '🎉 Pickup Approved - Your E-Waste Collection is Scheduled!';
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Great News!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your pickup has been approved!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Excellent news! Your e-waste pickup request has been <strong style="color: #10b981;">approved and scheduled</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin-top: 0;">Pickup Details:</h3>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Device:</strong> ${deviceInfo}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Address:</strong> ${pickup.pickupAddress}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Preferred Date:</strong> ${new Date(pickup.preferredPickupDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Scheduled</span></p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Our team will contact you soon to confirm the exact pickup time. Please keep your device ready and ensure someone is available at the pickup location.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">Thank you for choosing eco-friendly e-waste recycling! 🌱</p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'In Transit':
      subject = '🚚 Pickup Team En Route - We\'re Coming to Collect Your Device!';
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🚚 On The Way!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Our team is heading to your location</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Our pickup team is currently <strong style="color: #3b82f6;">en route</strong> to collect your ${deviceInfo}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1f2937; margin-top: 0;">Please Be Ready:</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Keep your ${pickup.deviceType} accessible</li>
                <li>Ensure someone is available at ${pickup.pickupAddress}</li>
                <li>Have any accessories or documentation ready if applicable</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Our team will contact you upon arrival. Thank you for your patience!
            </p>
          </div>
        </div>
      `;
      break;
      
    case 'Collected':
      subject = '📦 Device Successfully Collected - Thank You for Recycling!';
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📦 Successfully Collected!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your device is now in safe hands</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Great news! Your ${deviceInfo} has been <strong style="color: #059669;">successfully collected</strong> by our team.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="color: #1f2937; margin-top: 0;">What's Next:</h3>
              <ul style="color: #4b5563; line-height: 1.6;">
                <li>Your device will be transported to our recycling facility</li>
                <li>We'll perform quality checks and data destruction</li>
                <li>You'll receive updates on the recycling process</li>
                <li>Environmental impact report will be shared</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for choosing responsible e-waste recycling. You're making a positive impact on the environment! 🌍
            </p>
          </div>
        </div>
      `;
      break;
      
    case 'Cancelled':
      subject = '❌ Pickup Cancelled - We\'re Here to Help';
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">❌ Pickup Cancelled</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">We're sorry for the inconvenience</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We regret to inform you that your pickup for ${deviceInfo} has been <strong style="color: #dc2626;">cancelled</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #1f2937; margin-top: 0;">Need Help?</h3>
              <p style="color: #4b5563; line-height: 1.6;">
                Please contact our support team for assistance or to reschedule your pickup. We're here to help you with responsible e-waste disposal.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We apologize for any inconvenience caused and look forward to serving you in the future.
            </p>
          </div>
        </div>
      `;
      break;
      
    default:
      subject = `📱 Pickup Status Update - ${newStatus}`;
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📱 Status Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your pickup status has been updated</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              The status of your pickup for ${deviceInfo} has been updated to: <strong style="color: #6b7280;">${newStatus}</strong>
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
              <p style="margin: 5px 0; color: #4b5563;"><strong>Device:</strong> ${deviceInfo}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Current Status:</strong> ${newStatus}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
  }
  
  try {
    await sendEmail(pickup.userId.email, subject, emailBody);
    console.log(`Status notification sent to ${pickup.userId.email} for pickup ${pickup._id}`);
  } catch (emailError) {
    console.error("Error sending email notification:", emailError);
    throw emailError;
  }
}

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

// Get All Pickups (for admin/management purposes)
exports.getAllPickups = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      city,
      state,
      fromDate,
      toDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.pickupStatus = status;
    }
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }
    
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalPickups = await SchedulePickup.countDocuments(filter);

    // Fetch pickups with pagination and population
    const pickups = await SchedulePickup.find(filter)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('assignedRecyclerId', 'ownerName companyName email phoneNumber')
      .populate('assignedDeliveryPartnerId', 'name email phoneNumber vehicleType vehicleNumber isAvailable')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalPickups / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      message: "Pickups retrieved successfully",
      data: {
        pickups,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPickups,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching all pickups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching pickups",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// Assign Delivery Partner to Pickup
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId } = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID format"
      });
    }
    
    if (!deliveryPartnerId || !isValidObjectId(deliveryPartnerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid delivery partner ID is required"
      });
    }

    // Check if pickup exists
    const pickup = await SchedulePickup.findById(id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found"
      });
    }

    // Verify delivery partner exists and is available
    const DeliveryPartner = require("../models/DeliveryPartner");
    const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);
    
    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found"
      });
    }

    if (!deliveryPartner.isAvailable || deliveryPartner.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: "Delivery partner is not available for assignment"
      });
    }

    // Check if delivery partner serves the pickup area
    const isAreaServed = deliveryPartner.serviceAreas.some(area => 
      area.city.toLowerCase() === pickup.city.toLowerCase() && 
      area.pincode === pickup.pincode
    );

    if (!isAreaServed) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner does not serve this area"
      });
    }

    // Update pickup with delivery partner assignment
    const updatedPickup = await SchedulePickup.findByIdAndUpdate(
      id,
      { 
        assignedDeliveryPartnerId: deliveryPartnerId,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('assignedDeliveryPartnerId', 'name email phoneNumber vehicleType vehicleNumber');

    res.json({
      success: true,
      message: "Delivery partner assigned successfully",
      data: updatedPickup
    });

  } catch (error) {
    console.error("Error assigning delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while assigning delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};