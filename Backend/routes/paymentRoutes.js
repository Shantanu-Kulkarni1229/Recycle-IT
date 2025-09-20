const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByOrderId,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');

// Validation middleware
const validateCreateOrder = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required (in paise)'
    });
  }
  
  next();
};

const validatePaymentVerification = (req, res, next) => {
  const { orderId, paymentId, signature } = req.body;
  
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      success: false,
      message: 'Order ID, Payment ID, and Signature are required'
    });
  }
  
  next();
};

// Routes
router.post('/create-order', protect, validateCreateOrder, createOrder);
router.post('/verify', protect, validatePaymentVerification, verifyPayment);
router.post('/webhook', handleWebhook); // No auth for webhooks
router.get('/history', protect, getPaymentHistory);
router.get('/order/:orderId', protect, getPaymentByOrderId);
router.post('/refund/:paymentId', protect, refundPayment);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment routes are working!',
    timestamp: new Date().toISOString(),
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

module.exports = router;