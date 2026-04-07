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
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile required"
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const key = email || mobile;

    otpStore[key] = otp;

    console.log("OTP:", otp); // 🔥 for mobile testing

    // 📧 If email → send mail
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "your_email@gmail.com",
          pass: "your_app_password",
        },
      });

      await transporter.sendMail({
        to: email,
        subject: "Kisan Setu OTP",
        text: `Your OTP is ${otp}`,
      });
    }

    // 📱 If mobile → just console (for now)
    if (mobile) {
      console.log(`Send this OTP to mobile ${mobile}: ${otp}`);
    }

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;

    const key = email || mobile;

    if (otpStore[key] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // find user
    let user;
    if (email) user = await User.findOne({ email });
    if (mobile) user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json({
        message: "User not found, please register"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    delete otpStore[key];

    res.json({
      token,
      role: user.role,
      message: "Login successful"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
