// routes/analyticsRoutes.js
import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// /api/analytics/:userId?timeframe=daily|weekly|monthly
router.get("/:userId", getAnalytics);

export default router;
