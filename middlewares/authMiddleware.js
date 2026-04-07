import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ✅ ADD THIS

// =========================
// VERIFY TOKEN
// =========================
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch FULL USER
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    req.user = user;       // ✅ full user (role available)
    req.userId = user._id; // ✅ id

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// =========================
// ROLE BASED ACCESS
// =========================
export const allowRoles = (...roles) => {
  return (req, res, next) => {

    // 🔥 USE req.user (no DB call again)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};