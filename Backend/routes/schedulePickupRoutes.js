const express = require("express");
const uploadToCloudinary = require("../middleware/uploadToCloudinary");
const {
  createPickup,
  updatePickup,
  cancelPickup,
  getPickupById,
  getUserPickups,
  assignRecycler,
  assignDeliveryAgent,
  updatePickupStatus,
  trackPickup,
  deletePickup,
  removePickupFile, // NEW
} = require("../controllers/schedulePickupController");

const router = express.Router();

// Routes with file upload support
router.post("/", 
  uploadToCloudinary.fields([
    { name: 'deviceImages', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  createPickup
);

router.put("/:id", 
  uploadToCloudinary.fields([
    { name: 'deviceImages', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]),
  updatePickup
);

// Existing routes (no file upload needed)
router.put("/:id/cancel", cancelPickup);
router.get("/user/:userId", getUserPickups);
router.get("/:id", getPickupById);
router.put("/:id/assign-recycler", assignRecycler);
router.put("/:id/assign-agent", assignDeliveryAgent);
router.put("/:id/status", updatePickupStatus);
router.get("/:id/track", trackPickup);
router.delete("/:id", deletePickup);

// NEW: Remove specific file from pickup
router.delete("/:id/file", removePickupFile);

module.exports = router;