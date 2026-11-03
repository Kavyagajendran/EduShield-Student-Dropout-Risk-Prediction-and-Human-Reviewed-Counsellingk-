import { Response } from "express";
import { Student } from "../models/Student";
import { PredictionRecord } from "../models/PredictionRecord";
import { AuthRequest } from "../middleware/auth";
import { MLServiceClient } from "../services/mlService";
import { logAuditEvent } from "../services/auditService";

export const predictStudentRisk = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ student_id: studentId });

    if (!student) {
      res.status(404).json({ error: `Student ${studentId} not found` });
      return;
    }

    // Prepare payload matching ML service features
    const studentFeatures = {
      student_id: student.student_id,
      department: student.department,
      current_semester: student.current_semester,
      gpa_current: student.gpa_current,
      gpa_previous_semester: student.gpa_previous_semester,
      high_school_gpa: student.high_school_gpa,
      credits_completed_ratio: student.credits_completed_ratio,
      attendance_rate: student.attendance_rate,
      lab_attendance_rate: student.lab_attendance_rate,
      backlog_count: student.backlog_count,
      repeated_courses_count: student.repeated_courses_count,
      assignment_submission_rate: student.assignment_submission_rate,
      quiz_average_score: student.quiz_average_score,
      lms_logins_per_week: student.lms_logins_per_week,
      forum_participation_count: student.forum_participation_count,
      library_checkouts: student.library_checkouts,
      video_watch_ratio: student.video_watch_ratio,
      study_hours_per_week: student.study_hours_per_week,
      scholarship_recipient: student.scholarship_recipient,
      tuition_fees_up_to_date: student.tuition_fees_up_to_date,
      parental_education_level: student.parental_education_level,
      family_income_bracket: student.family_income_bracket,
      stress_level_score: student.stress_level_score,
      sleep_hours_per_day: student.sleep_hours_per_day,
      commute_time_minutes: student.commute_time_minutes,
      social_belonging_score: student.social_belonging_score
    };

    const mlResponse = await MLServiceClient.predictStudent(studentFeatures);

    // Save prediction record
    const record = await PredictionRecord.create({
      student_id: student.student_id,
      dropout_risk_probability: mlResponse.dropout_risk_probability,
      risk_category: mlResponse.risk_category,
      prediction_label: mlResponse.prediction_label,
      champion_model: mlResponse.champion_model,
      base_value: mlResponse.base_value,
      confidence_score: mlResponse.confidence_score,
      top_contributing_features: mlResponse.top_contributing_features,
      positive_contributions: mlResponse.positive_contributions,
      negative_contributions: mlResponse.negative_contributions,
      plain_language_explanation: mlResponse.plain_language_explanation,
      suggested_areas_for_review: mlResponse.suggested_areas_for_review,
      suggested_interventions: mlResponse.suggested_interventions,
      requires_human_review: mlResponse.requires_human_review,
      evaluatedByUserId: req.user?.userId || "system",
      evaluatedAt: new Date()
    });

    // Update student's current state
    student.currentRiskProbability = mlResponse.dropout_risk_probability;
    student.currentRiskCategory = mlResponse.risk_category;
    student.requiresHumanReview = mlResponse.requires_human_review;
    student.lastEvaluatedAt = new Date();
    await student.save();

    await logAuditEvent(
      req,
      "EXECUTE_PREDICTION",
      "PredictionRecord",
      record._id.toString(),
      `Executed ML risk inference & SHAP attribution for ${student.student_id} (Risk: ${mlResponse.risk_category}, Prob: ${mlResponse.risk_percentage}%)`
    );

    res.json({
      prediction: mlResponse,
      recordId: record._id
    });
  } catch (err: any) {
    res.status(500).json({ error: `Prediction failed: ${err.message}` });
  }
};

export const getStudentPredictionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const history = await PredictionRecord.find({ student_id: studentId })
      .sort({ evaluatedAt: -1 })
      .limit(20);

    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch history: ${err.message}` });
  }
};

export const getLatestPrediction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const latest = await PredictionRecord.findOne({ student_id: studentId })
      .sort({ evaluatedAt: -1 });

    if (!latest) {
      res.status(404).json({ error: "No prediction records found for this student" });
      return;
    }

    res.json({ prediction: latest });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch prediction: ${err.message}` });
  }
};

