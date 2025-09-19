const { body, param, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for creating payment order
 */
const validateCreateOrder = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0')
    .custom((value) => {
      // Ensure amount is in paise (multiply by 100 if needed)
      if (value < 100 && value > 0) {
        throw new Error('Amount should be in paise (minimum 100 paise = ₹1)');
      }
      return true;
    }),
  
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  
  body('serviceType')
    .optional()
    .isIn(['pickup', 'premium_service', 'donation'])
    .withMessage('Invalid service type'),
  
  body('deviceInfo')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Device info must be between 3 and 200 characters'),
  
  body('pickupAddress')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Pickup address must be between 10 and 500 characters'),
  
  handleValidationErrors,
];

/**
 * Validation rules for payment verification
 */
const validatePaymentVerification = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid order ID format'),
  
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .matches(/^pay_/)
    .withMessage('Invalid payment ID format'),
  
  body('signature')
    .notEmpty()
    .withMessage('Signature is required')
    .isLength({ min: 64, max: 128 })
    .withMessage('Invalid signature format'),
  
  handleValidationErrors,
];

/**
 * Validation for webhook endpoints
 */
const validateWebhookSignature = (req, res, next) => {
  const signature = req.get('X-Razorpay-Signature');
  
  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Webhook signature missing',
    });
  }
  
  req.webhookSignature = signature;
  next();
};

module.exports = {
  validateCreateOrder,
  validatePaymentVerification,
  validateWebhookSignature,
  handleValidationErrors,
};