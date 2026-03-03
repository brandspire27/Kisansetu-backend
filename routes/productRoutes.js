const express = require("express");
const router = express.Router();

const {
    addProduct,
    getProducts,
    getMyProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const { protect, onlyFarmer } = require("../middleware/authMiddleware");

// Public route
router.get("/", getProducts);

// Farmer routes
router.get("/my-products", protect, onlyFarmer, getMyProducts);

router.post("/", protect, onlyFarmer, addProduct);

router.put("/:id", protect, onlyFarmer, updateProduct);

router.delete("/:id", protect, onlyFarmer, deleteProduct);

module.exports = router;