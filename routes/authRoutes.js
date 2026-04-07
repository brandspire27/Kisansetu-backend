const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
// Get all farmers
router.get("/farmers", async (req, res) => {
    const farmers = await User.find({ role: "farmer" });
    res.json(farmers);
});

// Get all consumers
router.get("/consumers", async (req, res) => {
    const consumers = await User.find({ role: "consumer" });
    res.json(consumers);
});

module.exports = router;
