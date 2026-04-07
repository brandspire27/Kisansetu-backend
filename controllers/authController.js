const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

// 🔥 Temporary OTP store (later we use DB)
const otpStore = {};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile is required"
      });
    }

    let query = [];
    if (email) query.push({ email });
    if (mobile) query.push({ mobile });

    const existingUser = await User.findOne({ $or: query });

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

// ================= LOGIN (PASSWORD) =================
exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile is required"
      });
    }

    let query = [];
    if (email) query.push({ email });
    if (mobile) query.push({ mobile });

    const user = await User.findOne({ $or: query });

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

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔥 generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // store OTP
    otpStore[email] = otp;

    console.log("OTP:", otp); // for testing

    // ✉️ send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your_email@gmail.com",
        pass: "your_app_password", // ⚠️ use Gmail App Password
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Kisan Setu OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found, please register"
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // remove OTP after use
    delete otpStore[email];

    res.json({
      token,
      role: user.role,
      message: "Login successful via OTP"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
