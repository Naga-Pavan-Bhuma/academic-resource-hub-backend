import express from "express";
import Activity from "../models/Activity.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get recent activity (latest 10)
router.get("/", verifyToken, async (req, res) => {
  try {
    const logs = await Activity.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(logs);
  } catch (err) {
    console.error("Activity route error:", err);
    res.status(500).json({ message: "Error fetching activity" });
  }
});

export default router;
