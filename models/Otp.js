import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expires after 300 seconds (5 min)
});

export default mongoose.model("Otp", otpSchema);
