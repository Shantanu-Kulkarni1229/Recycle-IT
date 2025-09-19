const express = require('express');
const { getAllUsers } = require('../controllers/UserController');
const router = express.Router();
const {
  getAllRecyclers,
  getAllTransactions,
  getDashboardStats,
  getRecyclerById,
  updateRecyclerVerification
} = require('../controllers/AdminController');

// Middleware for admin authentication
const adminAuth = (req, res, next) => {
  // For development purposes, we'll use a simple check
  // In production, implement proper JWT-based admin authentication
  const adminToken = req.headers.authorization?.split(' ')[1];
  
  if (adminToken === 'admin-jwt-token') {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }
};

// Apply admin authentication to all routes
router.use(adminAuth);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/admin/recyclers - Get all recyclers
router.get('/recyclers', getAllRecyclers);

// GET /api/admin/recyclers/:id - Get recycler by ID with full details
router.get('/recyclers/:id', getRecyclerById);

// PUT /api/admin/recyclers/:id/verify - Update recycler verification status
router.put('/recyclers/:id/verify', updateRecyclerVerification);

// GET /api/admin/transactions - Get all transactions
router.get('/transactions', getAllTransactions);

router.get('/all-users', getAllUsers);
module.exports = router;
