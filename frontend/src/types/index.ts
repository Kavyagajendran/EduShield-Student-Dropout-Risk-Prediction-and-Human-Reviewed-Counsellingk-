export type UserRole = "admin" | "faculty" | "student";

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  assignedStudentIds?: string[];
  studentRefId?: string;
}

export interface Student {
  _id: string;
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
  stress_level_score: number;
  sleep_hours_per_day: number;
  commute_time_minutes: number;
  social_belonging_score: number;
  dropout_risk?: number;
  currentRiskProbability: number;
  currentRiskCategory: "Low" | "Moderate" | "High";
  requiresHumanReview: boolean;
  counsellingStatus: "None" | "Referred" | "In Progress" | "Completed" | "Resolved";
  lastEvaluatedAt: string;
}

export interface SHAPFeatureContribution {
  feature: string;
  feature_label: string;
  original_value: any;
  shap_value: number;
  direction: "increases_risk" | "decreases_risk";
  magnitude: number;
  description: string;
}

export interface SuggestedIntervention {
  category: "Academic" | "Attendance" | "Financial" | "Well-being" | "Engagement";
  title: string;
  rationale: string;
  priority: "High" | "Medium" | "Standard";
  suggested_action: string;
}

export interface PredictionResult {
  student_id: string;
  dropout_risk_probability: number;
  risk_percentage: number;
  risk_category: "Low" | "Moderate" | "High";
  prediction_label: string;
  champion_model: string;
  base_value: number;
  confidence_score: number;
  top_contributing_features: SHAPFeatureContribution[];
  positive_contributions: SHAPFeatureContribution[];
  negative_contributions: SHAPFeatureContribution[];
  plain_language_explanation: string;
  suggested_areas_for_review: string[];
  suggested_interventions: SuggestedIntervention[];
  requires_human_review: boolean;
}

export interface CounsellingSession {
  sessionId?: string;
  sessionDate: string;
  counsellorName: string;
  notes: string;
  interventionsApplied: string[];
  studentResponse: string;
  nextFollowUpDate?: string;
  status: "Conducted" | "Missed" | "Rescheduled";
}

export interface CounsellingReferral {
  _id: string;
  student_id: string;
  studentName: string;
  referralDate: string;
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
    followUpDate?: string;
  };
  sessions: CounsellingSession[];
  progressRating: "Worsening" | "Stable" | "Improving" | "Resolved";
  finalOutcome?: string;
  resolvedAt?: string;
}

export interface ModelBenchmarkData {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
}

export interface BenchmarkMetricsResponse {
  timestamp: string;
  dataset_sample_size: number;
  train_samples: number;
  test_samples: number;
  champion_model: string;
  selection_rationale: string;
  models: Record<string, ModelBenchmarkData>;
  roc_curves: Record<string, { fpr: number[]; tpr: number[]; auc: number }>;
  global_feature_importance: Array<{ feature: string; importance: number; rank: number }>;
}

export interface DashboardAnalytics {
  summary: {
    totalStudents: number;
    highRiskCount: number;
    moderateRiskCount: number;
    lowRiskCount: number;
    requiresReviewCount: number;
    activeReferralsCount: number;
    highRiskPercentage: number;
  };
  departmentDistribution: Array<{
    department: string;
    total: number;
    avgGpa: number;
    avgAttendance: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
  }>;
  riskDistribution: Array<{
    bin: string;
    count: number;
    label: string;
  }>;
  scatterData: Array<{
    student_id: string;
    name: string;
    gpa: number;
    attendance: number;
    backlogs: number;
    riskProbability: number;
    riskCategory: string;
  }>;
}

export interface AuditLogItem {
  _id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}

