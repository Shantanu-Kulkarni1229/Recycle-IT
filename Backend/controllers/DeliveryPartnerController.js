const mongoose = require("mongoose");
const DeliveryPartner = require("../models/DeliveryPartner");

// Validation function for ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// 1. Create a new delivery partner
exports.createDeliveryPartner = async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated recycler:', req.recycler ? req.recycler._id : 'No recycler');
    
    const {
      name,
      email,
      phoneNumber,
      vehicleType,
      vehicleNumber,
      serviceAreas,
      workingHours,
      workingDays,
      notes
    } = req.body;

    // Get recycler ID from authenticated recycler (auth middleware sets req.recycler)
    const recyclerId = req.recycler?._id || req.body.recyclerId;
    
    console.log('Using recycler ID:', recyclerId);
    
    if (!recyclerId || !isValidObjectId(recyclerId)) {
      console.log('Invalid recycler ID validation failed');
      return res.status(400).json({
        success: false,
        message: "Valid recycler ID is required"
      });
    }

    // Validate required fields
    const requiredFields = ["name", "email", "phoneNumber", "vehicleType", "vehicleNumber"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Check if partner with same email already exists for this recycler
    const existingPartner = await DeliveryPartner.findOne({
      recyclerId,
      email: email.toLowerCase()
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "A delivery partner with this email already exists for your account"
      });
    }

    // Create new delivery partner
    const deliveryPartnerData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.replace(/\D/g, ''), // Remove non-digits
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      serviceAreas: serviceAreas || [],
      workingHours: workingHours || { start: "09:00", end: "18:00" },
      workingDays: workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      recyclerId,
      notes: notes?.trim() || ""
    };
    
    console.log('Creating delivery partner with data:', JSON.stringify(deliveryPartnerData, null, 2));
    
    const deliveryPartner = new DeliveryPartner(deliveryPartnerData);

    await deliveryPartner.save();

    res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      data: deliveryPartner
    });

  } catch (error) {
    console.error("Error creating delivery partner:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 2. Get all delivery partners for a recycler
exports.getDeliveryPartners = async (req, res) => {
  try {
    const recyclerId = req.recycler?._id || req.params.recyclerId;
    
    if (!recyclerId || !isValidObjectId(recyclerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid recycler ID is required"
      });
    }

    const {
      status,
      isAvailable,
      city,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { recyclerId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }
    
    if (city) {
      filter['serviceAreas.city'] = new RegExp(city, 'i');
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const totalPartners = await DeliveryPartner.countDocuments(filter);

    // Fetch partners
    const partners = await DeliveryPartner.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const partnersWithMetrics = partners.map(partner => ({
      ...partner,
      successRate: partner.totalPickups > 0 
        ? Math.round((partner.completedPickups / partner.totalPickups) * 100)
        : 0,
      vehicleInfo: `${partner.vehicleType} - ${partner.vehicleNumber}`
    }));

    const totalPages = Math.ceil(totalPartners / parseInt(limit));

    res.json({
      success: true,
      message: "Delivery partners retrieved successfully",
      data: {
        partners: partnersWithMetrics,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPartners,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error("Error getting delivery partners:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching delivery partners",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 3. Get a specific delivery partner
exports.getDeliveryPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const recyclerId = req.recycler?._id || req.query.recyclerId;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery partner ID format"
      });
    }

    const partner = await DeliveryPartner.findOne({
      _id: id,
      recyclerId
    }).lean();

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found"
      });
    }

    // Add computed fields
    const partnerWithMetrics = {
      ...partner,
      successRate: partner.totalPickups > 0 
        ? Math.round((partner.completedPickups / partner.totalPickups) * 100)
        : 0,
      vehicleInfo: `${partner.vehicleType} - ${partner.vehicleNumber}`
    };

    res.json({
      success: true,
      message: "Delivery partner retrieved successfully",
      data: partnerWithMetrics
    });

  } catch (error) {
    console.error("Error getting delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 4. Update delivery partner
exports.updateDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const recyclerId = req.recycler?._id || req.body.recyclerId;
    const updateData = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery partner ID format"
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.recyclerId;
    delete updateData.totalPickups;
    delete updateData.completedPickups;
    delete updateData.createdAt;

    // Format phone number if provided
    if (updateData.phoneNumber) {
      updateData.phoneNumber = updateData.phoneNumber.replace(/\D/g, '');
    }

    // Format vehicle number if provided
    if (updateData.vehicleNumber) {
      updateData.vehicleNumber = updateData.vehicleNumber.toUpperCase().trim();
    }

    // Format email if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      
      // Check for duplicate email (excluding current partner)
      const existingPartner = await DeliveryPartner.findOne({
        _id: { $ne: id },
        recyclerId,
        email: updateData.email
      });

      if (existingPartner) {
        return res.status(400).json({
          success: false,
          message: "A delivery partner with this email already exists"
        });
      }
    }

    const updatedPartner = await DeliveryPartner.findOneAndUpdate(
      { _id: id, recyclerId },
      updateData,
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );

    if (!updatedPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found"
      });
    }

    res.json({
      success: true,
      message: "Delivery partner updated successfully",
      data: updatedPartner
    });

  } catch (error) {
    console.error("Error updating delivery partner:", error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while updating delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 5. Delete delivery partner
exports.deleteDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const recyclerId = req.recycler?._id || req.query.recyclerId;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery partner ID format"
      });
    }

    const deletedPartner = await DeliveryPartner.findOneAndDelete({
      _id: id,
      recyclerId
    });

    if (!deletedPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found"
      });
    }

    res.json({
      success: true,
      message: "Delivery partner deleted successfully",
      data: deletedPartner
    });

  } catch (error) {
    console.error("Error deleting delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 6. Get available partners for specific area
exports.getAvailablePartners = async (req, res) => {
  try {
    const { city, pincode, recyclerId } = req.query;
    
    if (!city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "City and pincode are required"
      });
    }

    // Build query for available partners
    const query = {
      isAvailable: true,
      status: 'Active',
      'serviceAreas.city': new RegExp(city, 'i'),
      'serviceAreas.pincode': pincode
    };

    // If recyclerId is provided, filter by specific recycler
    if (recyclerId && isValidObjectId(recyclerId)) {
      query.recyclerId = recyclerId;
    }

    const availablePartners = await DeliveryPartner.find(query)
      .populate('recyclerId', 'ownerName companyName email phoneNumber')
      .lean();

    // Add availability status for current time
    const partnersWithAvailability = availablePartners.map(partner => {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.toTimeString().slice(0, 5);
      
      // Check if partner is working today using workingDays array and workingHours object
      const isWorkingToday = partner.workingDays?.includes(currentDay);
      const isInWorkingHours = isWorkingToday && 
        partner.workingHours?.start && 
        partner.workingHours?.end &&
        currentTime >= partner.workingHours.start && 
        currentTime <= partner.workingHours.end;

      return {
        ...partner,
        isAvailableNow: isInWorkingHours,
        performanceMetrics: {
          totalDeliveries: partner.performanceMetrics?.totalDeliveries || 0,
          completedDeliveries: partner.performanceMetrics?.completedDeliveries || 0,
          successRate: partner.performanceMetrics?.successRate || 0,
          averageRating: partner.performanceMetrics?.averageRating || 5.0,
          totalRatings: partner.performanceMetrics?.totalRatings || 0
        }
      };
    });

    res.json({
      success: true,
      message: "Available delivery partners retrieved successfully",
      data: {
        deliveryPartners: partnersWithAvailability,
        count: partnersWithAvailability.length,
        area: { city, pincode }
      }
    });

  } catch (error) {
    console.error("Error getting available partners:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching available partners",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};

// 7. Update partner availability
exports.updatePartnerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const recyclerId = req.recycler?._id || req.body.recyclerId;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery partner ID format"
      });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean value"
      });
    }

    const updatedPartner = await DeliveryPartner.findOneAndUpdate(
      { _id: id, recyclerId },
      { isAvailable },
      { new: true, lean: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found"
      });
    }

    res.json({
      success: true,
      message: `Partner availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: updatedPartner
    });

  } catch (error) {
    console.error("Error updating partner availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating availability",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};