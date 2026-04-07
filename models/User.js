const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    mobile: {
  type: String,
  unique: true,
   sparse: true
   },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["farmer", "consumer","admin",],
        default: "consumer"
    }
});

module.exports = mongoose.model("User", userSchema);
