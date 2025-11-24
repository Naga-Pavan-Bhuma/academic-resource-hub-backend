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


// POST create discussion thread
router.post("/", verifyToken, async (req, res) => {
  const { title, resourceId } = req.body;

  if (!title) 
    return res.status(400).json({ error: "Title is required" });

  try {
    const newDiscussion = new Discussion({
      title,
      createdBy: req.userId,        // 🔥 Secure
      resourceId: resourceId || null,
      comments: []
    });

    await newDiscussion.save();
    await newDiscussion.populate("createdBy", "name");

    // 🔥 Log activity
    await logActivity(req.userId, "discussion_create", `Started a discussion: ${title}`);

    res.status(201).json(newDiscussion);

  } catch (err) {
    console.error("Failed to create discussion:", err);
    res.status(500).json({ error: "Failed to create discussion" });
  }
});


// POST add comment to discussion
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!text) 
    return res.status(400).json({ error: "Comment text is required" });

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) 
      return res.status(404).json({ error: "Discussion not found" });

    discussion.comments.push({
      text,
      postedBy: req.userId          // 🔥 Secure
    });

    await discussion.save();
    await discussion.populate([
      { path: "createdBy", select: "name" },
      { path: "comments.postedBy", select: "name" }
    ]);

    // 🔥 Log activity
    await logActivity(req.userId, "discussion_comment", `Commented on: ${discussion.title}`);

    res.json(discussion);

  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
