// routes/authRoutes.js
import express from "express";
import { signup, login, sendOtp, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/login", login);

// OTP
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
