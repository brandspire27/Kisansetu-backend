import connectDB from "@/lib/db";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const orders = await Order.find().populate("userId");
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, status } = req.body;

      await Order.findByIdAndUpdate(id, { status });

      return res.status(200).json({ message: "Order updated" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
