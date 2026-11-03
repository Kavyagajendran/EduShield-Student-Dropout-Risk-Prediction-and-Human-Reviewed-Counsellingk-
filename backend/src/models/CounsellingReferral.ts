import mongoose, { Document, Schema } from "mongoose";

export interface ICounsellingSession {
  sessionId?: string;
  sessionDate: Date;
  counsellorName: string;
  notes: string;
  interventionsApplied: string[];
  studentResponse: string;
  nextFollowUpDate?: Date;
  status: "Conducted" | "Missed" | "Rescheduled";
}

export interface ICounsellingReferral extends Document {
  student_id: string;
  studentName: string;
  referralDate: Date;
  referredByUserId: string;
  referredByName: string;
  assignedCounsellor: string;
  urgency: "High" | "Medium" | "Routine";
  category: "Academic" | "Attendance" | "Financial" | "Well-being" | "Engagement";
  reason: string;
  shapEvidenceSummary?: string;
  status: "Referred" | "Scheduled" | "In Progress" | "Completed" | "Resolved";
  actionPlan: {
    targetGoals: string[];
    academicMilestones: string;
    supportResourcesAssigned: string[];
    followUpDate?: Date;
  };
  sessions: ICounsellingSession[];
  progressRating: "Worsening" | "Stable" | "Improving" | "Resolved";
  finalOutcome?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CounsellingSessionSchema = new Schema<ICounsellingSession>(
  {
    sessionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    sessionDate: { type: Date, default: Date.now },
    counsellorName: { type: String, required: true },
    notes: { type: String, required: true },
    interventionsApplied: { type: [String], default: [] },
    studentResponse: { type: String, default: "" },
    nextFollowUpDate: { type: Date, default: null },
    status: { type: String, enum: ["Conducted", "Missed", "Rescheduled"], default: "Conducted" }
  },
  { _id: false }
);

const CounsellingReferralSchema = new Schema<ICounsellingReferral>(
  {
    student_id: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    referralDate: { type: Date, default: Date.now, index: true },
    referredByUserId: { type: String, required: true },
    referredByName: { type: String, required: true },
    assignedCounsellor: { type: String, required: true },
    urgency: { type: String, enum: ["High", "Medium", "Routine"], default: "Medium", index: true },
    category: {
      type: String,
      enum: ["Academic", "Attendance", "Financial", "Well-being", "Engagement"],
      required: true,
      index: true
    },
    reason: { type: String, required: true },
    shapEvidenceSummary: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Referred", "Scheduled", "In Progress", "Completed", "Resolved"],
      default: "Referred",
      index: true
    },
    actionPlan: {
      targetGoals: { type: [String], default: [] },
      academicMilestones: { type: String, default: "" },
      supportResourcesAssigned: { type: [String], default: [] },
      followUpDate: { type: Date, default: null }
    },
    sessions: { type: [CounsellingSessionSchema], default: [] },
    progressRating: {
      type: String,
      enum: ["Worsening", "Stable", "Improving", "Resolved"],
      default: "Stable"
    },
    finalOutcome: { type: String, default: "" },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const CounsellingReferral = mongoose.model<ICounsellingReferral>("CounsellingReferral", CounsellingReferralSchema);

