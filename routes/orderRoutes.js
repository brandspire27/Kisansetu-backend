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

router.get("/", async (req, res) => {
    const orders = await Order.find().populate("product user");
    res.json(orders);
});

router.delete("/:id", async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
});
module.exports = router;
