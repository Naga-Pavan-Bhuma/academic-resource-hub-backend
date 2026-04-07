import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String], // for MCQ
  correctAnswer: String,
  type: { type: String, enum: ["mcq", "short"], default: "mcq" }
});

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pdfUrl: String,
  questions: [questionSchema],
  score: { type: Number, default: 0 },
  attempted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);