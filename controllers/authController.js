// controllers/authController.js
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password, not raw Gmail password
  },
});

// ====== SIGNUP ======
// signup in controller
export const signup = async (req, res) => {
  try {
    const { name, collegeId, email, mobile, year, branch, password } = req.body;

    // check OTP verified
    const otpRecord = await Otp.findOne({ email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: "Please verify OTP before signup" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, collegeId, email, mobile, year, branch, password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // cleanup OTP record
    await Otp.deleteMany({ email });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ====== LOGIN ======
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ====== SEND OTP ======
export const sendOtp = async (req, res) => {
  try {
    const body = req.body || {};
    const email = body.email;

    console.log("sendOtp req.body:", req.body);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB
    await Otp.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    // Send mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otpCode}. It will expire in 5 minutes.`,
    });

    console.log(`OTP sent to ${email}: ${otpCode}`);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ====== VERIFY OTP ======
export const verifyOtp = async (req, res) => {
  try {
    const body = req.body || {};
    const { email, otp } = body;

    console.log("verifyOtp req.body:", req.body);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    console.log(`OTP verified for ${email}`);

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

