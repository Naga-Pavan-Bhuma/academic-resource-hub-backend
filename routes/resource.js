import express from "express";
import Resource from "../models/Resource.js";
import User from "../models/User.js"; // ✅ Import User model

const router = express.Router();

// Create a new resource
router.post("/", async (req, res) => {
  try {
    const {
      title,
      subject,
      uploadedBy,
      collegeId,
      year,
      sem,
      unitNumber,
      branch,
      file,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !subject ||
      !uploadedBy ||
      !collegeId ||
      !year ||
      !sem ||
      !unitNumber ||
      !branch ||
      !file
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save resource
    const newResource = new Resource({
      title,
      subject,
      uploadedBy,
      collegeId,
      year,
      sem,
      unitNumber,
      branch,
      file,
      tags: tags || [],
    });

    const savedResource = await newResource.save();

    // 🔥 Increment points for the uploader
    await User.findOneAndUpdate(
      { collegeId },              // Match user by collegeId
      { $inc: { points: 10 } },   // Increase points by 10
      { new: true }               // Return updated user
    );

    res.status(201).json({
      message: "Resource uploaded successfully! +10 points awarded 🎉",
      resource: savedResource,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all resources with optional filters
router.get("/", async (req, res) => {
  try {
    const { subject, year, sem, branch, tags } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (year) query.year = year;
    if (sem) query.sem = sem;
    if (branch) query.branch = branch;
    if (tags) query.tags = { $in: tags.split(",") };

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------- RATING ENDPOINTS ------------------- */

// Get average rating and rating count
router.get("/:id/rating", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    res.json({
      average: Math.round(resource.avgRating * 10) / 10,
      count: resource.ratingCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit or update a rating
router.post("/:id/rate", async (req, res) => {
  try {
    const { userId, value } = req.body;
    if (!userId || !value || value < 1 || value > 5)
      return res.status(400).json({ message: "Invalid rating" });

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Check if user has already rated
    const existing = resource.ratings.find(r => r.userId.toString() === userId);
    if (existing) {
      existing.value = value; // update existing rating
    } else {
      resource.ratings.push({ userId, value });
    }

    resource.updateRatingStats(); // recalc avgRating and ratingCount
    await resource.save();

    res.json({
      message: "Rating submitted",
      avgRating: resource.avgRating,
      ratingCount: resource.ratingCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
