const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Must provide at least one
    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile is required"
      });
    }

    // Build dynamic query
    let query = [];
    if (email) query.push({ email });
    if (mobile) query.push({ mobile });

    const existingUser = await User.findOne({
      $or: query
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      password: hashedPassword,
      role
    };

    if (email) userData.email = email;
    if (mobile) userData.mobile = mobile;

    const user = new User(userData);

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Must provide one
    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile is required"
      });
    }

    // Build dynamic query
    let query = [];
    if (email) query.push({ email });
    if (mobile) query.push({ mobile });

    const user = await User.findOne({
      $or: query
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }
console.log("SIGN SECRET:", process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
