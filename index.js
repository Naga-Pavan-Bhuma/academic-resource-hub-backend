import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import resourceRoutes from "./routes/resource.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import bookmarkRouter from "./routes/bookmark.js";
import discussionRouter from "./routes/discussion.js";
import userRouter from "./routes/users.js";

const app = express();


const allowedOrigins = [
  process.env.CLIENT_URL,       
  "http://localhost:5173",      
];

// ✅ Smart CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman / server-side
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/discussions", discussionRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/users", userRouter);


// ✅ Root route (for sanity check)
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API is running 🚀" });
});

// ✅ Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
