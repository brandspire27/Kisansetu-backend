require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ✅ Create app FIRST
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Import Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

// ✅ Routes
app.get("/", (req, res) => {
    res.send("🌾 KisanSetu Backend Running");
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// ✅ Connect DB then Start Server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
})
.catch((err) => {
    console.log("MongoDB Connection Error:", err);
});