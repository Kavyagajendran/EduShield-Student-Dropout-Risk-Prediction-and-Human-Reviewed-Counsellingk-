import { Router, Request, Response } from "express";
import { MLServiceClient } from "../services/mlService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/benchmark", async (_req: Request, res: Response) => {
  try {
    const data = await MLServiceClient.getBenchmarkMetrics();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: `ML Service benchmark unavailable: ${err.message}` });
  }
});

router.get("/feature-importance", async (_req: Request, res: Response) => {
  try {
    const data = await MLServiceClient.getGlobalFeatureImportance();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: `ML Service feature importance unavailable: ${err.message}` });
  }
});

export default router;

