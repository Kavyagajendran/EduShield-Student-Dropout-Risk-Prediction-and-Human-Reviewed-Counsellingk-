import { Router, Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { authenticateToken, requireRoles, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);
router.use(requireRoles("admin"));

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(Math.min(200, parseInt(String(limit), 10)));
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch audit logs: ${err.message}` });
  }
});

export default router;

