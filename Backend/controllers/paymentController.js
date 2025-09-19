const Payment = require('../models/Payment');
const { razorpay, verifyPaymentSignature, verifyWebhookSignature } = require('../utils/razorpayConfig');
const crypto = require('crypto');

/**
 * Create a new payment order
 * POST /api/payments/order
 */
const createOrder = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'INR', 
      serviceType = 'pickup',
      deviceInfo,
      pickupAddress 
    } = req.body;
    
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    // Generate unique order ID
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: parseInt(amount), // Amount in paise
      currency,
      receipt: orderId,
      notes: {
        userId,
        serviceType,
        deviceInfo: deviceInfo || '',
        pickupAddress: pickupAddress || '',
      },
    });
    
    // Save payment record to database
    const payment = new Payment({
      userId,
      orderId,
      amount: parseInt(amount),
      currency,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      serviceType,
      deviceInfo,
      pickupAddress,
    });
    
    await payment.save();
    
    // Return order details to frontend
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        name: 'EcoRecycle Platform',
        description: `Payment for ${serviceType} service`,
        prefill: {
          name: req.user.name,
          email: req.user.email,
          contact: req.user.phone,
        },
        theme: {
          color: '#10B981', // Green theme for recycling platform
        },
        notes: razorpayOrder.notes,
      },
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Verify payment after completion
 * POST /api/payments/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user.id;
    
    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      userId,
      status: 'pending',
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found or already processed',
      });
    }
    
    // Verify signature
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValidSignature) {
      // Mark payment as failed
      await payment.markAsFailed('Invalid payment signature');
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
    
    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(paymentId);
    
    if (razorpayPayment.status === 'captured') {
      // Mark payment as successful
      await payment.markAsSuccess(paymentId, signature);
      
      // TODO: Trigger post-payment actions
      // - Send confirmation email
      // - Schedule device pickup
      // - Update user's recycling dashboard
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          serviceType: payment.serviceType,
        },
      });
      
    } else {
      await payment.markAsFailed(`Payment status: ${razorpayPayment.status}`);
      
      res.status(400).json({
        success: false,
        message: 'Payment not captured',
        status: razorpayPayment.status,
      });
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Handle Razorpay webhooks
 * POST /api/payments/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.webhookSignature;
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature);
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }
    
    const { event, payload } = req.body;
    const paymentEntity = payload.payment.entity;
    
    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
        
      case 'order.paid':
        await handleOrderPaid(paymentEntity);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Handle successful payment capture
 */
const handlePaymentCaptured = async (paymentEntity) => {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });
    
    if (payment && payment.status === 'pending' && !payment.webhookProcessed) {
      await payment.markAsSuccess(paymentEntity.id, null);
      payment.webhookProcessed = true;
      await payment.save();
      
      console.log(`Payment captured via webhook: ${paymentEntity.id}`);
      
      // TODO: Trigger post-payment actions
      // - Send confirmation notifications
      // - Update service scheduling
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentEntity) => {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });
    
    if (payment && payment.status === 'pending' && !payment.webhookProcessed) {
      await payment.markAsFailed(paymentEntity.error_description || 'Payment failed');
      payment.webhookProcessed = true;
      await payment.save();
      
      console.log(`Payment failed via webhook: ${paymentEntity.id}`);
      
      // TODO: Handle failed payment
      // - Send failure notification
      // - Offer retry options
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

/**
 * Handle order paid event
 */
const handleOrderPaid = async (paymentEntity) => {
  console.log(`Order paid webhook received: ${paymentEntity.order_id}`);
  // Additional order-level processing if needed
};

/**
 * Get user's payment history
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const query = { userId };
    if (status) query.status = status;
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-razorpaySignature -webhookProcessed');
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
    });
  }
};

/**
 * Get payment details by order ID
 * GET /api/payments/order/:orderId
 */
const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const payment = await Payment.findOne({
      $or: [{ orderId }, { razorpayOrderId: orderId }],
      userId,
    }).select('-razorpaySignature -webhookProcessed');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    
    res.json({
      success: true,
      data: payment,
    });
    
  } catch (error) {
    console.error('Get payment by order ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
    });
  }
};

/**
 * Refund a payment
 * POST /api/payments/refund/:paymentId
 */
const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason = 'Customer request' } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check if payment is successful and can be refunded
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Only captured payments can be refunded',
      });
    }

    // Create refund via Razorpay
    const refundData = {
      payment_id: payment.razorpayPaymentId,
    };

    if (amount) {
      refundData.amount = parseInt(amount); // Amount in paise
    }

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, refundData);

    // Update payment record
    payment.status = 'refunded';
    payment.refund = {
      refundId: refund.id,
      amount: refund.amount,
      reason: reason,
      processedAt: new Date(),
    };
    
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        payment,
        refund,
      },
    });
    
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentByOrderId,
  refundPayment,
};