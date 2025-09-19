require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


// Import routes
const userRoutes = require('./routes/userRoutes');
const recyclerRoutes = require('./routes/recyclerRoutes');
const schedulePickupRoutes = require('./routes/schedulePickupRoutes');
const recyclerPickupRoutes = require("./routes/recyclerPickupRoutes");
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/recycler-pickups", recyclerPickupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recyclers', recyclerRoutes);
app.use('/api/schedule-pickup', schedulePickupRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (Enhanced for file upload errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
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
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// PORT setup
const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
