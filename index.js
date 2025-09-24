import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/Auth.js";

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // tighten CORS for security
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB not connected
  });

// ===== Routes =====
app.use("/api/auth", authRoutes);

// ===== Health Check (optional) =====
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API is running 🚀" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
