// routes/resource.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createResource,
  getResources,
  getResourceById,
  incrementViews,
  incrementDownloads
} from "../controllers/resourceController.js";

const router = express.Router();

// Create resource (Cloudinary → backend)
router.post("/", verifyToken, createResource);

router.get("/", getResources);
router.get("/:id", getResourceById);

router.patch("/:id/view", incrementViews);
router.patch("/:id/download", incrementDownloads);

export default router;
