const BlockchainRecord = require('../models/BlockchainRecord');

const saveUrlToBlockchain = async (pickupId, cloudinaryUrl) => {
  // Find the last block to get its hash
  const lastBlock = await BlockchainRecord.findOne().sort({ timestamp: -1 });

  const newBlock = new BlockchainRecord({
    pickupId,
    cloudinaryUrl,
    previousHash: lastBlock ? lastBlock.hash : 'GENESIS'
  });

  // Generate hash for this block
  newBlock.hash = newBlock.generateHash();

  await newBlock.save();
  return newBlock;
};

module.exports = saveUrlToBlockchain;
