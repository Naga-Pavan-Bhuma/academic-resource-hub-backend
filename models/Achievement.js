import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "levelup" }, // could be 'levelup', 'streak', etc
    title: { type: String, required: true },    // e.g., "Reached Bronze"
    levelKey: { type: String },                // 'bronze'
    levelName: { type: String },               // 'Bronze'
    points: { type: Number },                  // points at achievement
    meta: { type: Object },                    // optional extra info
  },
  { timestamps: true }
);

export default mongoose.model("Achievement", achievementSchema);
