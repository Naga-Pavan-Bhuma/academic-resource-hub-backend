import express from "express";
import { login, getMe, googleLogin } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { signup } from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", verifyToken, getMe);

// ===== OTP routes =====
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
export default router;
