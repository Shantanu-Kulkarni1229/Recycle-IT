const express = require('express');
const router = express.Router();
const BlockchainRecord = require('../models/BlockchainRecord');

// POST /api/blockchain-records/dummy - create a dummy blockchain record
router.post('/dummy', async (req, res) => {
  try {
    const lastBlock = await BlockchainRecord.findOne().sort({ timestamp: -1 });
    const mongoose = require('mongoose');
    const newBlock = new BlockchainRecord({
      pickupId: new mongoose.Types.ObjectId(),
      cloudinaryUrl: `device-inspection-${Date.now()}`,
      previousHash: lastBlock ? lastBlock.hash : 'GENESIS',
      hash: '',
    });
    newBlock.hash = newBlock.generateHash();
    await newBlock.save();
    res.json({ success: true, message: 'Dummy blockchain record created', data: newBlock });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating dummy blockchain record', error: error.message });
  }
});

// Confirm received (recycler action)
const { confirmReceived } = require('../controllers/recyclerPickupController');
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
