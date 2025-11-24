import express from "express";
import Achievement from "../models/Achievement.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get achievements for logged-in user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
