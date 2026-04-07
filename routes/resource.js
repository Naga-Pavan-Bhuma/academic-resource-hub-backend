// routes/resource.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import Resource from "../models/Resource.js";

import { allowRoles } from "../middlewares/authMiddleware.js";


import {
  createResource,
  getResources,
  getResourceById,
  incrementViews,
  incrementDownloads,
  searchResources   // 👈 add this
} from "../controllers/resourceController.js";


const router = express.Router();

// Create resource (Cloudinary → backend)
router.post("/", verifyToken, createResource);

router.get("/", getResources);
// 🔍 SEARCH
router.get("/search", searchResources);

router.get("/:id", getResourceById);

router.patch("/:id/view", incrementViews);
router.patch("/:id/download", incrementDownloads);

// GET pending resources (faculty only)
router.get("/pending", verifyToken, async (req, res) => {
  const resources = await Resource.find({ status: "pending" });
  res.json(resources);
});

// APPROVE
router.patch("/:id/approve", verifyToken, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    {
      status: "approved",
      approvedBy: req.userId,
    },
    { new: true }
  );

  res.json(resource);
});

// REJECT
router.patch("/:id/reject", verifyToken, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );

  res.json(resource);
});

router.get(
  "/pending",
  verifyToken,
  allowRoles("faculty", "admin"),
  async (req, res) => {
    try {
      const resources = await Resource.find({ status: "pending" });
      res.json(resources);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.patch(
  "/:id/approve",
  verifyToken,
  allowRoles("faculty", "admin"),
  async (req, res) => {
    try {
      const resource = await Resource.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
          approvedBy: req.userId,
        },
        { new: true }
      );

      res.json(resource);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.patch(
  "/:id/reject",
  verifyToken,
  allowRoles("faculty", "admin"),
  async (req, res) => {
    try {
      const resource = await Resource.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );

      res.json(resource);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
