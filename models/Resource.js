import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  value: { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

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
  tags: { type: [String], default: [] },
  ratings: { type: [ratingSchema], default: [] },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

// Helper method to recalculate average rating
resourceSchema.methods.updateRatingStats = function() {
  const total = this.ratings.reduce((sum, r) => sum + r.value, 0);
  this.ratingCount = this.ratings.length;
  this.avgRating = this.ratingCount ? total / this.ratingCount : 0;
  return this.avgRating;
};

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
