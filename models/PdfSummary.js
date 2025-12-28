import mongoose from "mongoose";

const pdfSummarySchema = new mongoose.Schema(
  {
    pdfUrl: {
      type: String,
      required: true,
      unique: true,
    },
    text: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    modelUsed: {
      type: String,
      default: "gemini-2.5-flash",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PdfSummary", pdfSummarySchema);
