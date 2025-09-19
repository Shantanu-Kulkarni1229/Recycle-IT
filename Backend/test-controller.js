// Test file to check controller imports
const DeliveryPartnerController = require("./controllers/DeliveryPartnerController");

console.log("Controller object:", DeliveryPartnerController);
console.log("Available functions:", Object.keys(DeliveryPartnerController));

// Check each function type
Object.keys(DeliveryPartnerController).forEach(key => {
  console.log(`${key}:`, typeof DeliveryPartnerController[key]);
});