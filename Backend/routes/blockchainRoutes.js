const express = require('express');
const router = express.Router();
const { confirmReceived } = require('../controllers/recyclerPickupController');
const BlockchainRecord = require('../models/BlockchainRecord');

// Confirm received (recycler action)
router.post('/confirm-received/:id', confirmReceived);

// Get all blockchain records
router.get('/blockchain-records', async (req, res) => {
  try {
    const records = await BlockchainRecord.find().sort({ timestamp: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
