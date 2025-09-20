const Recycler = require('../models/Recycler');
// const User = require('../models/User');
const SchedulePickup = require('../models/SchedulePickup');
const { generateToken } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/emailService');
const { validationResult } = require('express-validator');

const RecyclerController = {
  // Test method to assign pickups to recyclers (for development)
  assignTestPickups: async (req, res) => {
    try {
      const recyclerId = req.recycler._id;
      
      // Find unassigned pickups
      const unassignedPickups = await SchedulePickup.find({ 
        assignedRecyclerId: { $exists: false },
        pickupStatus: 'Pending'
      }).limit(5);

      if (unassignedPickups.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No unassigned pickups available',
          count: 0
        });
      }

      // Assign them to this recycler
      const assignedPickups = await SchedulePickup.updateMany(
        { _id: { $in: unassignedPickups.map(p => p._id) } },
        { 
          assignedRecyclerId: recyclerId,
          pickupStatus: 'Scheduled'
        }
      );

      res.status(200).json({
        success: true,
        message: `${assignedPickups.modifiedCount} pickups assigned to recycler`,
        count: assignedPickups.modifiedCount
      });

    } catch (error) {
      console.error('Error assigning test pickups:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign test pickups',
        error: error.message
      });
    }
  },

  // sign/agree aggrement 

   getUnApprovedPickups: async (req, res) => {
    try {
      const approvedPickups = await SchedulePickup.find({ 
        pickupStatus: 'Pending' 
      })
      .populate('userId', 'name email phoneNumber address')
      .sort({ scheduledDate: 1 });

      res.status(200).json({
        success: true,
        message: 'UnApproved pickups retrieved successfully',
        count: approvedPickups.length,
        pickups: approvedPickups
      });

    } catch (error) {
      console.error('Error fetching approved pickups:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approved pickups',
        error: error.message
      });
    }
  },
  
  // aggreement signed
  aggreementSigned: async (req, res) => {
    try {
      const { id } = req.params;
      const recycler = await Recycler.findById(id);
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }
      recycler.aggreementSigned = true;
      await recycler.save();
      res.status(200).json({
        success: true,
        message: 'Terms and conditions accepted successfully'
      });
    } catch (error) {
      console.error('Error accepting terms and conditions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept terms and conditions',
        error: error.message
      });
    }
  },

  // Register new recycler
  registerRecycler: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { ownerName, companyName, email, password, phoneNumber, address, city, state, pincode } = req.body;

      const recyclerExists = await Recycler.findOne({ $or: [{ email }, { companyName }] });
      if (recyclerExists) {
        return res.status(400).json({
          success: false,
          message: 'Recycler already exists with this email or company name'
        });
      }
      
      
      const recycler = new Recycler({
        ownerName,
        companyName,
        email,
        password,
        phoneNumber,
        address,
        city,
        state,
        pincode,
        termsAccepted: true,
        termsAcceptedAt: new Date()
      });

      // Remove the incomplete agreement check since we handle it in frontend
      // if(recycler.aggreementSigned !== true){
      //   return res.status(400).json({
      //     success: false,
      //     recycler:{id: recycler._id},
      //     message: 'Please agree to the terms and conditions to proceed'
      //   });
      // }

      if (req.files && req.files.length > 0) {
        const documents = req.files.map(file => ({
          documentType: file.fieldname,
          documentUrl: file.path,
          uploadedAt: Date.now()
        }));
        recycler.verificationDocuments = documents;
      }

      const otp = recycler.generateOTP();
      await recycler.save();
      
      await sendOTPEmail(email, otp);

      res.status(201).json({
        success: true,
        message: 'Recycler registered successfully. Please verify your email.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Verify OTP
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const recycler = await Recycler.findOne({ 
        email,
        OTP: otp,
        OTPExpiry: { $gt: Date.now() }
      });

      if (!recycler) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      recycler.isVerified = true;
      recycler.OTP = undefined;
      recycler.OTPExpiry = undefined;
      await recycler.save();

      const token = generateToken(recycler._id, 'recycler');

      res.json({
        success: true,
        token,
        recycler: {
          _id: recycler._id,
          companyName: recycler.companyName,
          email: recycler.email,
          isVerified: recycler.isVerified
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Login recycler
  loginRecycler: async (req, res) => {
    try {
      const { email, password } = req.body;

      const recycler = await Recycler.findOne({ email });
      if (!recycler) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isMatch = await recycler.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!recycler.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      if (!recycler.termsAccepted) {
        return res.status(401).json({
          success: false,
          message: 'Please agree to the terms and conditions to proceed',
          recycler: {
            id: recycler._id
          }
        });
      }

      const token = generateToken(recycler._id, 'recycler');

      res.json({
        success: true,
        token,
        recycler: {
          _id: recycler._id,
          companyName: recycler.companyName,
          email: recycler.email,
          isVerified: recycler.isVerified,
          inspectionStatus: recycler.inspectionStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const recycler = await Recycler.findOne({ email });
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      const otp = recycler.generateOTP();
      await recycler.save();
      
      await sendOTPEmail(email, otp, 'reset');

      res.json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      const recycler = await Recycler.findOne({
        email,
        OTP: otp,
        OTPExpiry: { $gt: Date.now() }
      });

      if (!recycler) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      recycler.password = newPassword;
      recycler.OTP = undefined;
      recycler.OTPExpiry = undefined;
      await recycler.save();

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Resend OTP
  resendOtp: async (req, res) => {
    try {
      const { email } = req.body;

      const recycler = await Recycler.findOne({ email });
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      const otp = recycler.generateOTP();
      await recycler.save();
      
      await sendOTPEmail(email, otp);

      res.json({
        success: true,
        message: 'New OTP sent to your email'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Accept terms and conditions
  acceptTerms: async (req, res) => {
    try {
      const { recyclerId } = req.body;

      if (!recyclerId) {
        return res.status(400).json({
          success: false,
          message: 'Recycler ID is required'
        });
      }

      const recycler = await Recycler.findById(recyclerId);
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      if (!recycler.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      // Update terms acceptance
      recycler.termsAccepted = true;
      recycler.termsAcceptedAt = new Date();
      await recycler.save();

      // Generate token for login
      const token = generateToken(recycler._id, 'recycler');

      res.json({
        success: true,
        message: 'Terms and conditions accepted successfully',
        token,
        recycler: {
          _id: recycler._id,
          companyName: recycler.companyName,
          email: recycler.email,
          isVerified: recycler.isVerified,
          inspectionStatus: recycler.inspectionStatus,
          termsAccepted: recycler.termsAccepted
        }
      });
    } catch (error) {
      console.error('Accept terms error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update recycler profile
  updateRecyclerProfile: async (req, res) => {
    try {
      const recycler = await Recycler.findById(req.recycler._id);

      if (recycler) {
        recycler.ownerName = req.body.ownerName || recycler.ownerName;
        recycler.phoneNumber = req.body.phoneNumber || recycler.phoneNumber;
        recycler.address = req.body.address || recycler.address;
        recycler.city = req.body.city || recycler.city;
        recycler.state = req.body.state || recycler.state;
        recycler.pincode = req.body.pincode || recycler.pincode;

        if (req.body.password) {
          recycler.password = req.body.password;
        }

        const updatedRecycler = await recycler.save();

        res.json({
          success: true,
          recycler: {
            _id: updatedRecycler._id,
            ownerName: updatedRecycler.ownerName,
            companyName: updatedRecycler.companyName,
            email: updatedRecycler.email,
            phoneNumber: updatedRecycler.phoneNumber,
            address: updatedRecycler.address,
            city: updatedRecycler.city,
            state: updatedRecycler.state,
            pincode: updatedRecycler.pincode,
            isVerified: updatedRecycler.isVerified,
            inspectionStatus: updatedRecycler.inspectionStatus
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get recycler profile
  getRecyclerProfile: async (req, res) => {
    try {
      const recycler = await Recycler.findById(req.recycler._id)
        .select('-password -OTP -OTPExpiry')
        .populate('assignedEwaste');

      if (recycler) {
        res.json({
          success: true,
          recycler
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Upload documents
  uploadDocuments: async (req, res) => {
    try {
      const recycler = await Recycler.findById(req.recycler._id);

      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      if (req.files && req.files.length > 0) {
        const newDocuments = req.files.map(file => ({
          documentType: file.fieldname,
          documentUrl: file.path,
          uploadedAt: Date.now()
        }));

        recycler.verificationDocuments.push(...newDocuments);
        await recycler.save();

        res.json({
          success: true,
          message: 'Documents uploaded successfully',
          documents: recycler.verificationDocuments
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No documents uploaded'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update verification status (admin only)
  updateVerificationStatus: async (req, res) => {
    try {
      const { recyclerId, status } = req.body;

      const recycler = await Recycler.findById(recyclerId);
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      recycler.inspectionStatus = status;
      await recycler.save();

      res.json({
        success: true,
        message: 'Verification status updated successfully',
        status: recycler.inspectionStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get assigned e-waste
  getAssignedEwaste: async (req, res) => {
    try {
      const recyclerId = req.recycler._id;

      // Find all schedule pickups assigned to this recycler
      const assignedPickups = await SchedulePickup.find({ 
        assignedRecyclerId: recyclerId 
      })
      .populate('userId', 'name email phoneNumber')
      .sort({ preferredPickupDate: 1 });

      res.json({
        success: true,
        message: 'Assigned e-waste retrieved successfully',
        count: assignedPickups.length,
        data: assignedPickups
      });
    } catch (error) {
      console.error('Error fetching assigned e-waste:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assigned e-waste',
        error: error.message
      });
    }
  },

  // Update inspection status
  updateInspectionStatus: async (req, res) => {
    try {
      const { ewasteId, status } = req.body;

      const recycler = await Recycler.findById(req.recycler._id);
      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      // Update the inspection status of the specific e-waste
      // Note: This assumes there's an Ewaste model with an inspection status field
      const ewaste = await Ewaste.findById(ewasteId);
      if (!ewaste) {
        return res.status(404).json({
          success: false,
          message: 'E-waste not found'
        });
      }

      ewaste.inspectionStatus = status;
      await ewaste.save();

      res.json({
        success: true,
        message: 'Inspection status updated successfully',
        status: ewaste.inspectionStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete recycler (optional)
  deleteRecycler: async (req, res) => {
    try {
      const recycler = await Recycler.findById(req.recycler._id);

      if (!recycler) {
        return res.status(404).json({
          success: false,
          message: 'Recycler not found'
        });
      }

      await recycler.remove();

      res.json({
        success: true,
        message: 'Recycler account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Test endpoint to create recycler account without email verification
  testCreateRecycler: async (req, res) => {
    try {
      const {
        ownerName,
        companyName,
        email,
        password,
        phoneNumber,
        address,
        city,
        state,
        pincode
      } = req.body;

      // Validation
      if (!ownerName || !companyName || !email || !password || !phoneNumber || !address || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Check if recycler already exists
      const existingRecycler = await Recycler.findOne({ email });
      if (existingRecycler) {
        return res.status(400).json({
          success: false,
          message: 'Recycler with this email already exists'
        });
      }

      // Create recycler
      const recycler = new Recycler({
        ownerName,
        companyName,
        email,
        password,
        phoneNumber,
        address,
        city,
        state,
        pincode,
        isVerified: true, // Skip email verification for testing
        verificationStatus: 'approved' // Set as approved for testing
      });

      await recycler.save();

      res.status(201).json({
        success: true,
        message: 'Recycler account created successfully (Test Mode)',
        recycler: {
          id: recycler._id,
          ownerName: recycler.ownerName,
          companyName: recycler.companyName,
          email: recycler.email,
          phoneNumber: recycler.phoneNumber,
          address: recycler.address,
          city: recycler.city,
          state: recycler.state,
          pincode: recycler.pincode,
          isVerified: recycler.isVerified,
          verificationStatus: recycler.verificationStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = RecyclerController;