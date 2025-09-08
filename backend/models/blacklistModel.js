// models/TokenBlacklist.js
import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }, // auto remove expired tokens
});

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto delete after expiry

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);
