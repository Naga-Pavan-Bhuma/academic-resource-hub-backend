import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile, changePassword } from "../controllers/userController.js";

const router = express.Router();

// 👉 Existing route (keep it)
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 👉 New: Get logged-in user profile
router.get("/me", verifyToken, getProfile);

// 👉 New: Update user profile
router.put("/update", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);


export default router;
