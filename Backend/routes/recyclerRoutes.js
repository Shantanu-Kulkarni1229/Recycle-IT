const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const RecyclerController = require('../controllers/RecyclerController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware
const registerValidation = [
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Please enter a valid 6-digit pincode')
];

const passwordValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Public routes
router.post(
  '/register',
  upload.array('documents', 5),
  registerValidation,
  RecyclerController.registerRecycler
);
router.post('/verify-otp', RecyclerController.verifyOtp);
router.post('/login', RecyclerController.loginRecycler);
router.post('/forgot-password', RecyclerController.forgotPassword);
router.post('/reset-password', passwordValidation, RecyclerController.resetPassword);
router.post('/resend-otp', RecyclerController.resendOtp);
router.get('/unapproved-device', RecyclerController.getUnApprovedPickups);

// Test route (for development - bypasses email verification)
router.post('/test-create', RecyclerController.testCreateRecycler);

// Protected routes
router.get('/profile', protect, RecyclerController.getRecyclerProfile);
router.put('/profile', protect, RecyclerController.updateRecyclerProfile);
router.post(
  '/upload-documents',
  protect,
  upload.array('documents', 5),
  RecyclerController.uploadDocuments
);
router.get('/assigned-ewaste', protect, RecyclerController.getAssignedEwaste);
router.put('/inspection-status', protect, RecyclerController.updateInspectionStatus);
router.delete('/delete', protect, RecyclerController.deleteRecycler);

// Admin routes
router.put(
  '/verify/:id',
  protect,
  admin,
  RecyclerController.updateVerificationStatus
);

module.exports = router;