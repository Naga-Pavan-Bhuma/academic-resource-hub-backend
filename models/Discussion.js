import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const discussionSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", default: null }, // null = general discussion
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Discussion", discussionSchema);
