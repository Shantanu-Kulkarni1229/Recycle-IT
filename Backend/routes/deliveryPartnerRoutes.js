const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const DeliveryPartnerController = require("../controllers/DeliveryPartnerController");

// POST /api/delivery-partners - Create new delivery partner
router.post("/", protect, DeliveryPartnerController.createDeliveryPartner);

// GET /api/delivery-partners - Get all delivery partners for a recycler
router.get("/", DeliveryPartnerController.getDeliveryPartners);

// GET /api/delivery-partners/available - Get available partners for assignment
router.get("/available", protect, DeliveryPartnerController.getAvailablePartners);

// GET /api/delivery-partners/:id - Get specific delivery partner
router.get("/:id", protect, DeliveryPartnerController.getDeliveryPartnerById);

// PUT /api/delivery-partners/:id - Update delivery partner
router.put("/:id", protect, DeliveryPartnerController.updateDeliveryPartner);

// DELETE /api/delivery-partners/:id - Delete delivery partner
router.delete("/:id", protect, DeliveryPartnerController.deleteDeliveryPartner);

// PATCH /api/delivery-partners/:id/availability - Update partner availability
router.patch("/:id/availability", protect, DeliveryPartnerController.updatePartnerAvailability);

module.exports = router;