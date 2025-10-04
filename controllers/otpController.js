import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in MongoDB
    await Otp.findOneAndUpdate(
      { email },
      { code: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Create transporter exactly like your working code
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.APP_MAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.APP_MAIL,
      to: email,
      subject: "🎓 Welcome to Academic Resource Hub! Your OTP awaits 🎉",
      html: `
  <div style="font-family: 'Comic Sans MS', Arial, sans-serif; background: #f0f4ff; padding: 30px; border-radius: 15px; text-align: center; color: #333;">
    <h1 style="color: #4f46e5; font-size: 28px;">🎉 Welcome to Academic Resource Hub!</h1>
    <p style="font-size: 16px; margin: 10px 0;">Hey there, future scholar! You're just <strong>one step away</strong> from unlocking the awesomeness of our site.</p>
    
    <div style="margin: 20px 0; padding: 25px; background: #fff; border-radius: 15px; box-shadow: 0px 5px 20px rgba(0,0,0,0.15); display: inline-block; animation: bounce 1s ease infinite;">
      <h2 style="color: #ef4444; font-size: 36px; letter-spacing: 6px; margin: 0;">${otp}</h2>
      <p style="font-size: 14px; color: #555; margin-top: 10px;">Use this magical code to sign up & blast into the site 🚀</p>
    </div>

    <p style="margin: 20px 0; font-size: 14px;">If you didn’t request this, just ignore this email 😎</p>

    <style>
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    </style>
  </div>
  `,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const record = await Otp.findOne({ email });
    if (!record)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Compare as strings
    if (record.code.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
