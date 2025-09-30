import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { name, collegeId, email, mobile, year, branch, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      collegeId,
      email,
      mobile,
      year,
      branch,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("❌ Signup Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId; // set by verifyToken middleware
    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ GetMe Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check email domain
    if (!payload.email.endsWith("@rguktrkv.ac.in")) {
      return res.status(403).json({ message: "Use your college email only" });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        collegeId: payload.sub, // fallback if no college ID
        email: payload.email,
        mobile: "",
        year: "",
        branch: "",
        password: null, // Google account → no password
      });
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ user, token: appToken });
  } catch (err) {
    console.error("❌ Google Login Error:", err.message);
    res.status(400).json({ message: "Invalid Google token", error: err.message });
  }
};
