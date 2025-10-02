import express from "express";
import Discussion from "../models/Discussion.js";

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
router.post("/", async (req, res) => {
  const { title, createdBy, resourceId } = req.body;
  if (!title || !createdBy) return res.status(400).json({ error: "Missing required fields" });

  try {
    const newDiscussion = new Discussion({
      title,
      createdBy,
      resourceId: resourceId || null,
      comments: []
    });

    await newDiscussion.save();
    // Populate createdBy after saving (no chaining here)
    await newDiscussion.populate("createdBy", "name");
    
    res.status(201).json(newDiscussion);
  } catch (err) {
    console.error("Failed to create discussion:", err);
    res.status(500).json({ error: "Failed to create discussion" });
  }
});

// POST add comment to discussion
router.post("/:id/comments", async (req, res) => {
  const { text, postedBy } = req.body;
  if (!text || !postedBy) return res.status(400).json({ error: "Missing required fields" });

  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });

    discussion.comments.push({ text, postedBy });
    await discussion.save();

    // Populate multiple fields at once - no chaining, correct usage
    await discussion.populate([
      { path: "createdBy", select: "name" },
      { path: "comments.postedBy", select: "name" }
    ]);

    res.json(discussion);
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
