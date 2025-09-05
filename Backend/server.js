require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const recyclerRoutes = require('./routes/recyclerRoutes');
const schedulePickupRoutes = require('./routes/schedulePickupRoutes');
const recyclerPickupRoutes = require("./routes/recyclerPickupRoutes");
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// PORT setup
const PORT = process.env.PORT || 5000;
// const MONGO_URI = ""; // bhai yaha pr direct ya env me dal dena uri

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

