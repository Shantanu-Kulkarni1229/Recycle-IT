// routes/recyclerPickupRoutes.js
const express = require("express");
const {
  confirmReceived,
  inspectDevice,
  updateInspectionStatus,
  proposePayment,
  finalizePayment,
  rejectDevice,
  sendInspectionReport,
  getRecyclerPickups,
} = require("../controllers/recyclerPickupController");

const router = express.Router();

router.put("/:id/confirm-received", confirmReceived);
router.put("/:id/inspect", inspectDevice);
router.put("/:id/inspection-status", updateInspectionStatus);
router.put("/:id/propose-payment", proposePayment);
router.put("/:id/finalize-payment", finalizePayment);
router.put("/:id/reject", rejectDevice);
router.get("/:id/send-report", sendInspectionReport);
router.get("/recycler/:recyclerId", getRecyclerPickups);

module.exports = router;
