import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/Auth.js";

dotenv.config();

const app = express();

// ===== Allowed Origins =====
const allowedOrigins = [
  "http://localhost:5173",    // local dev
  process.env.CLIENT_URL       // any other origin from .env
];

// ===== Middleware =====
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl)
      if (!origin) return callback(null, true);
      // console.log("Allowed origins:", allowedOrigins);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true, // if using cookies or auth headers
  })
);

app.use(express.json()); // Parse JSON bodies

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== Routes =====
app.use("/api/auth", authRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API is running 🚀" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
