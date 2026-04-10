const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ✅ ADD THIS LINE

const {
  register,
  login,
  sendOTP
} = require("../controllers/authController"); // ❌ removed verifyOTP (not needed now)

// AUTH ROUTES
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);

// ✅ Get all farmers
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching farmers" });
  }
});

// ✅ Get all consumers
router.get("/consumers", async (req, res) => {
  try {
    const consumers = await User.find({ role: "consumer" });
    res.json(consumers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching consumers" });
  }
});

module.exports = router;
