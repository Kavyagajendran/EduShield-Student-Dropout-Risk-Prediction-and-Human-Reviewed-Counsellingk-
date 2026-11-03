import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import predictionRoutes from "./routes/predictionRoutes";
import counsellingRoutes from "./routes/counsellingRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import reportRoutes from "./routes/reportRoutes";
import modelRoutes from "./routes/modelRoutes";
import auditRoutes from "./routes/auditRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "EduShield Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/counselling", counsellingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/audit", auditRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

export default app;

