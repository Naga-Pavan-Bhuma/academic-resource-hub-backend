import express from "express";
import { summarizePdf , chatWithPdf} from "../controllers/pdfController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { generateQuiz, submitQuiz } from "../controllers/pdfController.js";

const router = express.Router();

// Protect summary API
router.post("/summarize", verifyToken, summarizePdf);

router.post("/chat", chatWithPdf);

router.post("/quiz", verifyToken, generateQuiz);
router.post("/quiz/submit", verifyToken, submitQuiz);

export default router;
