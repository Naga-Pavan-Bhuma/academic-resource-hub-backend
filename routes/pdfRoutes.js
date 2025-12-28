import express from "express";
import { summarizePdf , chatWithPdf} from "../controllers/pdfController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect summary API
router.post("/summarize", verifyToken, summarizePdf);

router.post("/chat", chatWithPdf);

export default router;
