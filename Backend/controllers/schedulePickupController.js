const mongoose = require("mongoose");
const SchedulePickup = require("../models/SchedulePickup");

// Validation function for ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// 1. Create Pickup Request
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
    
    const newPickup = new SchedulePickup(req.body);
    await newPickup.save();
    
    res.status(201).json({
      success: true,
      message: "Pickup request created successfully",
      data: newPickup
    });
  } catch (error) {
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

// 2. Update Pickup Request
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
    
    const updatedPickup = await SchedulePickup.findByIdAndUpdate(
      id, 
      req.body, 
      { 
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      message: "Pickup updated successfully",
      data: updatedPickup
    });
  } catch (error) {
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

// 3. Cancel Pickup Request
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

// 4. Get Pickup Details
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

// 5. Get All User Pickups
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

// 6. Assign Recycler
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

// 7. Assign Delivery Agent
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

// 8. Update Pickup Status
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

// 9. Track Pickup
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

// 10. Delete Pickup Request
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