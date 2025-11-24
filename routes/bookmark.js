import express from "express";
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

// Add bookmark
router.post("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.body;

  try {
    const resource = await Resource.findById(resourceId);

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookmarks: resourceId } }
    );

    // 🔥 FIXED — now sends action + message properly
    await logActivity(
      userId,
      "BOOKMARK_ADDED",
      `Bookmarked: ${resource?.title || resource?.file?.split("/").pop()}`
    );

    res.status(200).json({ message: "Resource bookmarked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.body;

  try {
    const resource = await Resource.findById(resourceId);

    await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarks: resourceId } }
    );

    // 🔥 FIXED — now logs remove event
    await logActivity(
      userId,
      "BOOKMARK_REMOVED",
      `Removed bookmark: ${resource?.title || resource?.file?.split("/").pop()}`
    );

    res.status(200).json({ message: "Bookmark removed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookmarks
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("bookmarks");
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
