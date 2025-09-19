const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number')
];

const passwordValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, UserController.registerUser);
router.post('/verify-otp', UserController.verifyOtp);
router.post('/login', UserController.loginUser);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', passwordValidation, UserController.resetPassword);
router.post('/resend-otp', UserController.resendOtp);
router.get('/recyclers', UserController.getAllRecyclers);

// Protected routes
router.get('/profile', protect, UserController.getUserProfile);
router.put('/profile', protect, UserController.updateUserProfile);

module.exports = router;