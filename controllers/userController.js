import User from "../models/User.js";
import bcrypt from "bcrypt";
import { logActivity } from "../utils/logActivity.js";

// =========================
// GET PROFILE
// =========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// =========================
// UPDATE PROFILE
// =========================
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "mobile", "year", "branch"];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    // 🔥 Log profile update activity
    await logActivity(req.userId, "profile_update", "Updated profile details");

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// =========================
// CHANGE PASSWORD
// =========================
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // 🔥 Log password change activity
    await logActivity(req.userId, "password_change", "Changed account password");

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
