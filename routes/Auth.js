import express from "express";
import { signup, login, getMe, googleLogin } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/google-login", googleLogin);

router.get("/me", verifyToken, getMe);

export default router;
