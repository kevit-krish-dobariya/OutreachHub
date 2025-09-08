
// routes/homeRoutes.js
import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { getHomeAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/analytics", verifyToken, getHomeAnalytics);

export default router;
