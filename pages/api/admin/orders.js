import connectDB from "@/lib/db";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const orders = await Order.find().populate("userId");
    return res.json(orders);
  }

  if (req.method === "PUT") {
    const { id, status } = req.body;

    await Order.findByIdAndUpdate(id, { status });
    return res.json({ message: "Order updated" });
  }
}