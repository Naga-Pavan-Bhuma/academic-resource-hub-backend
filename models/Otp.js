import mongoose from "mongoose";

// Otp schema (Otp.js)
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false }   // NEW
});

export default mongoose.model("Otp", otpSchema);
