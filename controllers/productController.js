const Product = require("../models/product");

// ✅ Add Product (Farmer only)
exports.addProduct = async (req, res) => {
  try {
    const { name, price, quantity, image } = req.body;

    const product = new Product({
      name,
      price,
      quantity,
      image,
      farmer: req.user.id
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get All Products (Public)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("farmer", "name email");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Logged-in Farmer Products
exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ farmer: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Product (Only Owner)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check ownership
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Product (Only Owner)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check ownership
        if (product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await product.deleteOne();

        res.json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};