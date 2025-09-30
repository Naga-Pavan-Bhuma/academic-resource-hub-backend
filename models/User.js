import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  year: { type: String },
  branch: { type: String },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
