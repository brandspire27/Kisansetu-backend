import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
