import { Router } from "express";
import { generateInstitutionalReport } from "../controllers/reportController";
import { authenticateToken, requireRoles } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);
router.get("/institutional", requireRoles("admin", "faculty"), generateInstitutionalReport);

export default router;

