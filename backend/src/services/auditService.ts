import { AuditLog } from "../models/AuditLog";
import { AuthRequest } from "../middleware/auth";

export const logAuditEvent = async (
  req: AuthRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: string
): Promise<void> => {
  try {
    const user = req.user;
    const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";

    await AuditLog.create({
      timestamp: new Date(),
      userId: user?.userId || "anonymous",
      userName: user?.name || "System/Anonymous",
      userRole: user?.role || "unknown",
      action,
      resourceType,
      resourceId: resourceId || null,
      details: details || "",
      ipAddress: String(ip)
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};
