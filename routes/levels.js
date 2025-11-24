import express from "express";
import { LEVELS } from "../utils/levelsConfig.js";

const router = express.Router();

// Public endpoint: return level config
router.get("/", (req, res) => {
  res.json(LEVELS);
});

export default router;
