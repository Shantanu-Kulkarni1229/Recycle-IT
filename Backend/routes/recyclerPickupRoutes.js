const express = require("express");
const router = express.Router();
const recyclerPickupController = require("../controllers/recyclerPickupController");
const uploadToCloudinary = require("../middleware/uploadToCloudinary");

// Existing routes (UNCHANGED)
router.post("/:id/confirm-received", recyclerPickupController.confirmReceived);
router.put("/:id/update-status", recyclerPickupController.updateInspectionStatus);
router.post("/:id/propose-payment", recyclerPickupController.proposePayment);
router.post("/:id/finalize-payment", recyclerPickupController.finalizePayment);
router.post("/:id/reject", recyclerPickupController.rejectDevice);
router.get("/recycler/:recyclerId", recyclerPickupController.getRecyclerPickups);

// ENHANCED routes with Cloudinary support
router.put("/:id/inspect", 
  uploadToCloudinary.fields([
    { name: 'inspectionImages', maxCount: 5 },
    { name: 'damageImages', maxCount: 5 }
  ]), 
  recyclerPickupController.inspectDevice
);

router.post("/:id/send-report", 
  uploadToCloudinary.single('reportDocument'), 
  recyclerPickupController.sendInspectionReport
);

// NEW route for uploading additional inspection images
router.post("/:id/upload-images", 
  uploadToCloudinary.multiple('images', 10), 
  recyclerPickupController.uploadInspectionImages
);

module.exports = router;