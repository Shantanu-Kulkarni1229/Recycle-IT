// routes/schedulePickupRoutes.js
const express = require("express");
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
} = require("../controllers/schedulePickupController");

const router = express.Router();

router.post("/", createPickup);
router.put("/:id", updatePickup);
router.put("/:id/cancel", cancelPickup);

router.get("/user/:userId", getUserPickups);  // explicit route for user
router.get("/:id", getPickupById);

router.put("/:id/assign-recycler", assignRecycler);
router.put("/:id/assign-agent", assignDeliveryAgent);
router.put("/:id/status", updatePickupStatus);
router.get("/:id/track", trackPickup);
router.delete("/:id", deletePickup);


module.exports = router;
