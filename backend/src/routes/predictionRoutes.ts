import { Router } from "express";
import {
  predictStudentRisk,
  getStudentPredictionHistory,
  getLatestPrediction
} from "../controllers/predictionController";
import { authenticateToken, requireRoles } from "../middleware/auth";
import { enforceStudentAccessScope } from "../middleware/accessControl";

const router = Router();

router.use(authenticateToken);

router.post("/:studentId", requireRoles("admin", "faculty"), enforceStudentAccessScope, predictStudentRisk);
router.get("/:studentId/history", enforceStudentAccessScope, getStudentPredictionHistory);
router.get("/:studentId/latest", enforceStudentAccessScope, getLatestPrediction);

export default router;

