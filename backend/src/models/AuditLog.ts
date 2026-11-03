import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: null },
    details: { type: String, default: "" },
    ipAddress: { type: String, default: "127.0.0.1" }
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

