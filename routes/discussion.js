import express from "express";
import Discussion from "../models/Discussion.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

// GET discussions - filter by resourceId or 'general'
router.get("/", async (req, res) => {
  const { resourceId, type } = req.query;
  let filter = {};

  if (type === "general") filter.resourceId = null;
  else if (resourceId) filter.resourceId = resourceId;

  try {
    const discussions = await Discussion.find(filter)
      .populate("createdBy", "name")
      .populate("comments.postedBy", "name")
      .sort({ createdAt: -1 });

    res.json(discussions);

  } catch (err) {
    console.error("Failed to fetch discussions:", err);
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
});

// =========================================
// 🚀 CREATE DISCUSSION THREAD (with WS emit)
// =========================================
router.post("/", verifyToken, async (req, res) => {
  const { title, resourceId } = req.body;

  if (!title)
    return res.status(400).json({ error: "Title is required" });

  try {
    const newDiscussion = new Discussion({
      title,
      createdBy: req.userId,
      resourceId: resourceId || null,
      comments: []
    });

    await newDiscussion.save();
    await newDiscussion.populate("createdBy", "name");

    // 🔥 Log activity
    await logActivity(req.userId, "discussion_create", `Started a discussion: ${title}`);

    // 🔥 Broadcast new thread to ALL users (optional)
    if (global._io) {
      global._io.emit("new_thread", newDiscussion);
    }

    res.status(201).json(newDiscussion);

  } catch (err) {
    console.error("Failed to create discussion:", err);
    res.status(500).json({ error: "Failed to create discussion" });
  }
});

// =========================================
// 🚀 ADD COMMENT (Secure + Real-time WS emit)
// =========================================
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!text)
    return res.status(400).json({ error: "Comment text is required" });

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion)
      return res.status(404).json({ error: "Discussion not found" });

    // Add comment
    discussion.comments.push({
      text,
      postedBy: req.userId
    });

    await discussion.save();
    await discussion.populate([
      { path: "createdBy", select: "name" },
      { path: "comments.postedBy", select: "name" }
    ]);

    // The newly-added comment object
    const newComment =
      discussion.comments[discussion.comments.length - 1];

    // 🔥 Real-time broadcast only to this thread room
    if (global._io) {
      global._io.to(req.params.id).emit("new_comment", {
        threadId: req.params.id,
        comment: newComment,
      });
    }

    // 🔥 Log activity
    await logActivity(req.userId, "discussion_comment", `Commented on: ${discussion.title}`);

    res.json(discussion);

  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// =========================================
// 🚀 DELETE THREAD (Creator-only + WS broadcast)
// =========================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion)
      return res.status(404).json({ error: "Discussion not found" });

    if (discussion.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "You are not allowed to delete this thread" });
    }

    await discussion.deleteOne();

    // 🔥 Log activity
    await logActivity(req.userId, "discussion_delete", `Deleted a discussion: ${discussion.title}`);

    // 🔥 Notify everyone (optional)
    if (global._io) {
      global._io.emit("thread_deleted", { threadId: req.params.id });
    }

    res.json({ message: "Discussion deleted successfully" });

  } catch (err) {
    console.error("Failed to delete discussion:", err);
    res.status(500).json({ error: "Failed to delete discussion" });
  }
});

export default router;
