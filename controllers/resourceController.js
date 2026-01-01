// controllers/resourceController.js
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import { addPointsAndHandleLevelUp } from "../utils/pointsLevelService.js";

// --------------------------------------
// CREATE RESOURCE (Cloudinary upload)
// --------------------------------------
export const createResource = async (req, res) => {
  try {
    const {
      title,
      subject,
      year,
      sem,
      unitNumber,
      branch,
      tags,
      file,          // Cloudinary URL
      uploadedBy,
      collegeId,
    } = req.body;

    if (!file) {
      return res.status(400).json({ message: "Cloudinary file URL missing" });
    }

    const resource = new Resource({
      title,
      subject,
      year,
      sem,
      unitNumber,
      branch,
      file,
      uploadedBy,
      collegeId,
      tags: tags || [],
    });

    const saved = await resource.save();

    // 🔹 Find real user based on auth (preferred) or collegeId fallback
    let user = null;
    if (req.userId) {
      user = await User.findById(req.userId);
    }
    if (!user && collegeId) {
      user = await User.findOne({ collegeId });
    }

    if (user) {
      // ✅ Add +10 points & handle level-ups centrally
      const { newLevel } = await addPointsAndHandleLevelUp(user._id, 10);

      // ✅ Log upload activity
      await logActivity(
        user._id,
        "upload",
        `Uploaded resource: ${title}`
      );

      // (optional) you could do something special if newLevel exists here
    }

    res.status(201).json({
      message: "Resource uploaded successfully (+10 points)",
      resource: saved,
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL RESOURCES
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE RESOURCE
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Not found" });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// VIEWS
export const incrementViews = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: updated.views });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DOWNLOAD COUNT
export const incrementDownloads = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    res.json({ downloads: updated.downloads });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 SEARCH RESOURCES (Indexed)
export const searchResources = async (req, res) => {
  try {
    const { q, year, sem, branch } = req.query;

    const filter = {};

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Filters
    if (year) filter.year = year;
    if (sem) filter.sem = sem;
    if (branch) filter.branch = branch;

    const resources = await Resource.find(filter, q ? {
      score: { $meta: "textScore" }
    } : {})
      .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 });

    res.json(resources);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
