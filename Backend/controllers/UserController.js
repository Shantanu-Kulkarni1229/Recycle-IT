const User = require('../models/User');
const Recycler = require('../models/Recycler');
const RecyclerPickup = require('../models/RecyclerPickup');
const { generateToken } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/emailService');
const { validationResult } = require('express-validator');

const UserController = {
  // get all recyclers
  getAllRecyclers:  async (req, res) => {
    try {
      const recyclers = await Recycler.find({})
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 });
      const recyclersWithStats = await Promise.all(
        recyclers.map(async (recycler) => {
          const pickups = await RecyclerPickup.find({ recyclerId: recycler._id });
  
          return {
            id: recycler._id,
            ownerName: recycler.ownerName,
            companyName: recycler.companyName,
            email: recycler.email,
            phoneNumber: recycler.phoneNumber,
            city: recycler.city,
            state: recycler.state,
            address: recycler.address,
            pincode: recycler.pincode,
            servicesOffered: recycler.servicesOffered,
            operatingHours: recycler.operatingHours,
            website: recycler.website,
            description: recycler.description
          };
        })
      );
  
      res.status(200).json({
        success: true,
        data: recyclersWithStats,
        total: recyclersWithStats.length
      });
  
    } catch (error) {
      console.error('Error fetching recyclers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recyclers',
        error: error.message
      });
    }
  },
  // Get recycler by ID with full details
    getRecyclerById : async (req, res) => {
      try {
        const { id } = req.params;
    
        const recycler = await Recycler.findById(id).select('-password');
        if (!recycler) {
          return res.status(404).json({
            success: false,
            message: 'Recycler not found'
          });
        }
    
        const pickups = await RecyclerPickup.find({ recyclerId: id }).sort({ createdAt: -1 });
    
        const recyclerDetails = {
          ...recycler.toObject(),
          transactions: pickups,
          totalTransactions: pickups.length,
          totalAmount: pickups.reduce((sum, pickup) => sum + (pickup.amount || 0), 0)
        };
    
        res.status(200).json({
          success: true,
          data: recyclerDetails
        });
    
      } catch (error) {
        console.error('Error fetching recycler details:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching recycler details',
          error: error.message
        });
      }
    },
  // get all users
  getAllUsers: async (req, res) => {
      try {
        const verifiedUsers = await SchedulePickup.find({ 
          isVerified: true 
        })
        .populate('userId', 'name email phoneNumber address');
  
        res.status(200).json({
          success: true,
          message: 'All verified users retrieved successfully',
          count: verifiedUsers.length,
          pickups: verifiedUsers
        });
  
      } catch (error) {
        console.error('Error fetching verified users:', error);
        
        res.status(500).json({
          success: false,
          message: 'Failed to fetch verified users',
          error: error.message
        });
      }
    },
  // Register new user
  registerUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, phoneNumber } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      const user = new User({
        name,
        email,
        password,
        phoneNumber
      });

      const otp = user.generateOTP();
      await user.save();
      
      await sendOTPEmail(email, otp);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.'
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

      const user = await User.findOne({ 
        email,
        OTP: otp,
        OTPExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      user.isVerified = true;
      user.OTP = undefined;
      user.OTPExpiry = undefined;
      await user.save();

      const token = generateToken(user._id, 'user');

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      const token = generateToken(user._id, 'user');

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified
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

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const otp = user.generateOTP();
      await user.save();
      
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

      const user = await User.findOne({
        email,
        OTP: otp,
        OTPExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      user.password = newPassword;
      user.OTP = undefined;
      user.OTPExpiry = undefined;
      await user.save();

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

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const otp = user.generateOTP();
      await user.save();
      
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

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        user.name = req.body.name || user.name;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        if (req.body.password) {
          user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
          success: true,
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            isVerified: updatedUser.isVerified
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = UserController;