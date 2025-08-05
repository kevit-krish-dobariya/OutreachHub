import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import TokenBlacklist from "../models/blacklistModel.js";

const JWT_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGIxMjM0ZjMwYWY4Njk0ZjMzNDdjZCIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NTM5NTIzODIsImV4cCI6MTc1Mzk1NTk4Mn0.-LC44yQGsUeeG0opWhVnBB5HI2zVh2_8YMa71aD5s0c"

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ error: "Token has been invalidated" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.token = token; // store token for logout
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

export default verifyToken;
