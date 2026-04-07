import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile, changePassword } from "../controllers/userController.js";
import { createFaculty } from "../controllers/userController.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

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


router.post("/create-faculty", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔥 Generate faculty ID automatically
    const collegeId = "FAC" + Date.now();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "faculty",
      collegeId,   // ✅ FIXED
      mobile: "",
      year: "NA",
      branch: "NA"
    });

    res.json({ message: "Faculty created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating faculty" });
  }
});

router.post(
  "/create-faculty",
  verifyToken,
  allowRoles("admin"),
  createFaculty
);


export default router;
