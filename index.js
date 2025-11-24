import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";              // ✅ Needed for socket server
import { Server } from "socket.io";   // ✅ Socket.IO

import authRoutes from "./routes/auth.js";
import resourceRoutes from "./routes/resource.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import bookmarkRouter from "./routes/bookmark.js";
import discussionRouter from "./routes/discussion.js";
import userRouter from "./routes/users.js";
import activityRouter from "./routes/activity.js";
import levelsRouter from "./routes/levels.js";
const app = express();

// Allowed CORS origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

// CORS setup
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

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });


// ===============================
// 🚀 SOCKET.IO SERVER SETUP
// ===============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // (Optional) Replace with CLIENT_URL for stricter control
    methods: ["GET", "POST"],
  },
});

// Make io available globally for logActivity.js
global._io = io;

io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});
// ===============================


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/discussions", discussionRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/users", userRouter);
app.use("/api/activity", activityRouter);
app.use("/api/levels", levelsRouter);

// Root Check
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API is running 🚀" });
});


// Start Server (Socket-enabled)
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running with SOCKET.IO at http://0.0.0.0:${PORT}`);
});
