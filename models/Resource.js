import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  collegeId: { type: String, required: true },
  year: { type: String, required: true },
  sem: { type: String, required: true },
  unitNumber: { type: Number, required: true },
  branch: { type: String, required: true },
  file: { type: String, required: true }, // Cloudinary URL
  tags: { type: [String], default: [] }
}, { timestamps: true });
const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
