import { Router } from "express";
import {
  createReferral,
  getReferrals,
  getReferralById,
  addSession,
  updateActionPlan,
  resolveReferral
} from "../controllers/counsellingController";
import { authenticateToken, requireRoles } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post("/", requireRoles("admin", "faculty"), createReferral);
router.get("/", getReferrals);
router.get("/:referralId", getReferralById);
router.post("/:referralId/sessions", requireRoles("admin", "faculty"), addSession);
router.put("/:referralId/action-plan", requireRoles("admin", "faculty"), updateActionPlan);
router.put("/:referralId/resolve", requireRoles("admin", "faculty"), resolveReferral);

export default router;

