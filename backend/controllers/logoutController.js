// controllers/authController.js
import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/blacklistModel.js";

export const logout = async (req, res) => {
  try {
    const token = req.token; // from verifyToken middleware
    if (!token) return res.status(401).json({ error: "No token provided" });

    // Decode to get expiry
    const decoded = jwt.decode(token);
    if (!decoded?.exp) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Convert exp to Date
    const expiryDate = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklist.create({ token, expiresAt: expiryDate });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
