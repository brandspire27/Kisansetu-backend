const Order = require("../models/Order");
const Product = require("../models/Product");

// Place Order
exports.placeOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const totalPrice = product.price * quantity;

        const order = new Order({
            product: productId,
            consumer: req.user.id,
            quantity,
            totalPrice
        });

        await order.save();
        res.status(201).json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Consumer Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user.id })
            .populate("product");

        res.json(orders);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Farmer Orders
exports.getFarmerOrders = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id });

    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      product: { $in: productIds }
    })
      .populate("product")
      .populate("consumer", "name email");

    // ALWAYS send array (even if empty)
    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id)
            .populate("product");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.product.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        order.status = status;
        await order.save();

        res.json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};