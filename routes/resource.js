import express from "express";
import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";
import Resource from "../models/Resource.js";

import {
  createResource,
  getResources,
  getResourceById,
  incrementViews,
  incrementDownloads,
  searchResources
} from "../controllers/resourceController.js";

const router = express.Router();

// CREATE RESOURCE
router.post("/", verifyToken, createResource);

// GET ALL APPROVED RESOURCES
router.get("/", getResources);

// 🔍 SEARCH
router.get("/search", searchResources);

// 🔥 IMPORTANT: KEEP THIS BEFORE :id ROUTE
// GET PENDING (faculty/admin only)
router.get(
  "/pending",
  verifyToken,
  allowRoles("faculty", "admin"),
  async (req, res) => {
    try {
      const resources = await Resource.find({ status: "pending" })
        .sort({ createdAt: -1 });

      res.json(resources);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching pending" });
    }
  }
);

// APPROVE RESOURCE
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

      res.json({ message: "Approved", resource });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Approval failed" });
    }
  }
);

// REJECT RESOURCE
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

      res.json({ message: "Rejected", resource });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Rejection failed" });
    }
  }
);

// GET SINGLE RESOURCE (KEEP LAST)
router.get("/:id", getResourceById);

// VIEWS
router.patch("/:id/view", incrementViews);

// DOWNLOAD
router.patch("/:id/download", incrementDownloads);

export default router;