import express from "express";
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.countDocuments();
    const faculty = await User.countDocuments({ role: "faculty" });
    const students = await User.countDocuments({ role: "student" });
    const resources = await Resource.countDocuments();

    const viewsAgg = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const views = viewsAgg[0]?.total || 0;

    res.json({
      users,
      faculty,
      students,
      resources,
      views,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;