require("dotenv").config();
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const express = require('express');
const mongoose = require('mongoose');

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit payment requests
  message: 'Too many payment requests, please try again later.',
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const recyclerRoutes = require('./routes/recyclerRoutes');
const schedulePickupRoutes = require('./routes/schedulePickupRoutes');
const recyclerPickupRoutes = require("./routes/recyclerPickupRoutes");
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();

// Security middleware (should be early)
app.use(helmet());

// CORS configuration (should be early)
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:3000", 
  credentials: true 
}));

// Rate limiting (apply general limiter to all routes)
app.use(generalLimiter);

// Body parsing middleware (should be before routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Raw body middleware specifically for webhook signature verification
// This must come BEFORE the payment routes
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use('/api/blockchain', blockchainRoutes);

// Routes with specific rate limiting
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use("/api/recycler-pickups", recyclerPickupRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recyclers', recyclerRoutes);
app.use('/api/schedule-pickup', schedulePickupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (err.message === 'Invalid file type. Only images and documents are allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - should be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// PORT setup
const PORT = process.env.PORT || 5000;

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if database connection fails
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed.');
    process.exit(0);
  });
});

module.exports = app;