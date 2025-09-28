import express from "express";
import { uploadResource, getResources } from "../controllers/resourceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Upload a resource with PDF file
router.post("/upload", verifyToken, upload.single("file"), uploadResource);

// Get all resources
router.get("/", getResources);

export default router;
