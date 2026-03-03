const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Consumer
router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

// Farmer
router.get("/farmer-orders", protect, getFarmerOrders);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;