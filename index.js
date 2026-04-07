import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import resourceRoutes from "./routes/resource.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import bookmarkRouter from "./routes/bookmark.js";
import discussionRouter from "./routes/discussion.js";
import userRouter from "./routes/users.js";
import activityRouter from "./routes/activity.js";
import levelsRouter from "./routes/levels.js";

import pdfRoutes from "./routes/pdfRoutes.js";

const app = express();

// Allowed CORS origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173"
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server or Postman

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

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
   .then(async () => {
    console.log("✅ MongoDB connected");

    // 🔥 RUN THIS ONCE
    

  }).catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ============================================
// 🚀 SOCKET.IO SETUP
// ============================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Make global so routes can emit
global._io = io;

io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id)  ;
  // --------------------------------------------
  // 🎯 THREAD CHAT ROOMS
  // --------------------------------------------
  socket.on("join_thread", (threadId) => {
    socket.join(threadId);

    const count =
      io.sockets.adapter.rooms.get(threadId)?.size || 1;

    io.to(threadId).emit("thread_users", {
      threadId,
      count,
    });
  });

  socket.on("leave_thread", (threadId) => {
    socket.leave(threadId);

    const count =
      io.sockets.adapter.rooms.get(threadId)?.size || 0;

    io.to(threadId).emit("thread_users", {
      threadId,
      count,
    });
  });

  // Typing Indicator
  socket.on("typing", ({ threadId, user }) => {
    socket.to(threadId).emit("typing", { user });
  });

  socket.on("stop_typing", ({ threadId, user }) => {
    socket.to(threadId).emit("stop_typing", { user });
  });

  // --------------------------------------------
  // 🧩 ACTIVITY ROOMS (user-specific)
  // --------------------------------------------
  socket.on("join_activity", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📌 Joined activity room: user_${userId}`);
  });

  socket.on("leave_activity", (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`🚪 Left activity room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ============================================


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/discussions", discussionRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/users", userRouter);
app.use("/api/activity", activityRouter);
app.use("/api/levels", levelsRouter);
app.use("/api/pdf", pdfRoutes);


// Root
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API running 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server with SOCKET.IO at http://localhost:${PORT}`);
});
