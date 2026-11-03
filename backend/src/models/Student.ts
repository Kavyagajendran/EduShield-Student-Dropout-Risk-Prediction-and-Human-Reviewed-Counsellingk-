import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  student_id: string;
  name: string;
  email: string;
  department: string;
  current_semester: number;
  assignedFacultyEmail?: string;
  gpa_current: number;
  gpa_previous_semester: number;
  high_school_gpa: number;
  credits_completed_ratio: number;
  attendance_rate: number;
  lab_attendance_rate: number;
  backlog_count: number;
  repeated_courses_count: number;
  assignment_submission_rate: number;
  quiz_average_score: number;
  lms_logins_per_week: number;
  forum_participation_count: number;
  library_checkouts: number;
  video_watch_ratio: number;
  study_hours_per_week: number;
  scholarship_recipient: number;
  tuition_fees_up_to_date: number;
  parental_education_level: string;
  family_income_bracket: string;
  // Voluntary confidential well-being metrics
  stress_level_score: number;
  sleep_hours_per_day: number;
  commute_time_minutes: number;
  social_belonging_score: number;
  // Risk state
  dropout_risk?: number;
  currentRiskProbability: number;
  currentRiskCategory: "Low" | "Moderate" | "High";
  requiresHumanReview: boolean;
  counsellingStatus: "None" | "Referred" | "In Progress" | "Completed" | "Resolved";
  lastEvaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    student_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true, index: true },
    current_semester: { type: Number, required: true, min: 1, max: 8 },
    assignedFacultyEmail: { type: String, default: null, index: true },
    gpa_current: { type: Number, required: true, min: 0.0, max: 4.0 },
    gpa_previous_semester: { type: Number, required: true, min: 0.0, max: 4.0 },
    high_school_gpa: { type: Number, required: true, min: 0.0, max: 4.0 },
    credits_completed_ratio: { type: Number, required: true, min: 0.0, max: 1.0 },
    attendance_rate: { type: Number, required: true, min: 0.0, max: 100.0 },
    lab_attendance_rate: { type: Number, required: true, min: 0.0, max: 100.0 },
    backlog_count: { type: Number, required: true, min: 0 },
    repeated_courses_count: { type: Number, required: true, min: 0 },
    assignment_submission_rate: { type: Number, required: true, min: 0.0, max: 100.0 },
    quiz_average_score: { type: Number, required: true, min: 0.0, max: 100.0 },
    lms_logins_per_week: { type: Number, required: true, min: 0 },
    forum_participation_count: { type: Number, required: true, min: 0 },
    library_checkouts: { type: Number, required: true, min: 0 },
    video_watch_ratio: { type: Number, required: true, min: 0.0, max: 1.0 },
    study_hours_per_week: { type: Number, required: true, min: 0.0 },
    scholarship_recipient: { type: Number, required: true, enum: [0, 1] },
    tuition_fees_up_to_date: { type: Number, required: true, enum: [0, 1] },
    parental_education_level: { type: String, required: true },
    family_income_bracket: { type: String, required: true },
    // Sensitive well-being fields (subject to RBAC masking)
    stress_level_score: { type: Number, default: 5, min: 1, max: 10 },
    sleep_hours_per_day: { type: Number, default: 7.0, min: 0.0, max: 24.0 },
    commute_time_minutes: { type: Number, default: 30, min: 0 },
    social_belonging_score: { type: Number, default: 5, min: 1, max: 10 },
    // System evaluation fields
    dropout_risk: { type: Number, default: 0 },
    currentRiskProbability: { type: Number, default: 0.0 },
    currentRiskCategory: { type: String, enum: ["Low", "Moderate", "High"], default: "Low", index: true },
    requiresHumanReview: { type: Boolean, default: false, index: true },
    counsellingStatus: {
      type: String,
      enum: ["None", "Referred", "In Progress", "Completed", "Resolved"],
      default: "None",
      index: true
    },
    lastEvaluatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", StudentSchema);

