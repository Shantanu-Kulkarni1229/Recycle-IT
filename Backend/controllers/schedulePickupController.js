// controllers/schedulePickupController.js
const SchedulePickup = require("../models/SchedulePickup");

// 1. Create Pickup Request
exports.createPickup = async (req, res) => {
  try {
    const newPickup = new SchedulePickup(req.body);

    // Assign nearest recycler (dummy for now)
    newPickup.assignedRecyclerId = null;

    await newPickup.save();
    res.status(201).json({ success: true, message: "Pickup request created", data: newPickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating pickup", error: error.message });
  }
};

// 2. Update Pickup Request
exports.updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id);

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    if (pickup.pickupStatus !== "Pending")
      return res.status(400).json({ success: false, message: "Pickup cannot be updated after confirmation" });

    const updatedPickup = await SchedulePickup.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: "Pickup updated", data: updatedPickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating pickup", error: error.message });
  }
};

// 3. Cancel Pickup Request
exports.cancelPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id);

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    if (pickup.assignedDeliveryAgentId)
      return res.status(400).json({ success: false, message: "Cannot cancel, delivery agent already assigned" });

    pickup.pickupStatus = "Cancelled";
    await pickup.save();
    res.json({ success: true, message: "Pickup cancelled", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling pickup", error: error.message });
  }
};

// 4. Get Pickup Details
exports.getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id)
      .populate("userId", "name email")
      .populate("assignedRecyclerId", "name")
      .populate("assignedDeliveryAgentId", "name");

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    res.json({ success: true, data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pickup", error: error.message });
  }
};

// 5. Get All User Pickups
exports.getUserPickups = async (req, res) => {
  try {
    const { userId } = req.params;
    const pickups = await SchedulePickup.find({ userId });
    res.json({ success: true, count: pickups.length, data: pickups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user pickups", error: error.message });
  }
};

// 6. Assign Recycler
exports.assignRecycler = async (req, res) => {
  try {
    const { id } = req.params;
    const { recyclerId } = req.body;

    const pickup = await SchedulePickup.findByIdAndUpdate(
      id,
      { assignedRecyclerId: recyclerId, pickupStatus: "Scheduled" },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    res.json({ success: true, message: "Recycler assigned", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error assigning recycler", error: error.message });
  }
};

// 7. Assign Delivery Agent
exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const pickup = await SchedulePickup.findByIdAndUpdate(
      id,
      { assignedDeliveryAgentId: agentId, pickupStatus: "In Transit" },
      { new: true }
    );

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    res.json({ success: true, message: "Delivery agent assigned", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error assigning delivery agent", error: error.message });
  }
};

// 8. Update Pickup Status
exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Scheduled", "In Transit", "Collected", "Delivered", "Verified", "Cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const pickup = await SchedulePickup.findByIdAndUpdate(id, { pickupStatus: status }, { new: true });
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    res.json({ success: true, message: "Pickup status updated", data: pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

// 9. Track Pickup
exports.trackPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await SchedulePickup.findById(id)
      .populate("assignedRecyclerId", "name location")
      .populate("assignedDeliveryAgentId", "name phone");

    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
    res.json({
      success: true,
      data: {
        status: pickup.pickupStatus,
        recycler: pickup.assignedRecyclerId,
        agent: pickup.assignedDeliveryAgentId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error tracking pickup", error: error.message });
  }
};

// 10. Delete Pickup Request
exports.deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SchedulePickup.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Pickup not found" });
    res.json({ success: true, message: "Pickup deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting pickup", error: error.message });
  }
};
