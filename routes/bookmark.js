import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Add a bookmark
router.post("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.body;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookmarks: resourceId } } // prevents duplicates
    );
    res.status(200).json({ message: "Resource bookmarked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a bookmark
router.delete("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.body;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarks: resourceId } }
    );
    res.status(200).json({ message: "Bookmark removed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookmarks for a user
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("bookmarks");
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
