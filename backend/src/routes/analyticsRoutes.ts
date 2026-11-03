import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);
router.get("/dashboard", getDashboardAnalytics);

export default router;

