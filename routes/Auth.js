import express from "express";
import { login, getMe, googleLogin, requestSignupOtp, verifySignupOtp } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
const router = express.Router();

router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", verifyToken, getMe);

// ===== Signup with OTP =====
router.post("/signup", requestSignupOtp);          // Step 1: request OTP
router.post("/signup/verify", verifySignupOtp);    // Step 2: verify OTP & create user
// ===== OTP routes =====
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;
