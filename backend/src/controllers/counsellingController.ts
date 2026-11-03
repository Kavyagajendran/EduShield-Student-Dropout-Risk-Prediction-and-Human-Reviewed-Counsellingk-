import { Response } from "express";
import { CounsellingReferral } from "../models/CounsellingReferral";
import { Student } from "../models/Student";
import { AuthRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";

export const createReferral = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      student_id,
      assignedCounsellor,
      urgency,
      category,
      reason,
      shapEvidenceSummary,
      targetGoals,
      academicMilestones,
      followUpDate
    } = req.body;

    const student = await Student.findOne({ student_id });
    if (!student) {
      res.status(404).json({ error: `Student ${student_id} not found` });
      return;
    }

    const referral = await CounsellingReferral.create({
      student_id: student.student_id,
      studentName: student.name,
      referralDate: new Date(),
      referredByUserId: user.userId,
      referredByName: user.name,
      assignedCounsellor: assignedCounsellor || "Faculty Advisory Cell",
      urgency: urgency || "Medium",
      category,
      reason,
      shapEvidenceSummary: shapEvidenceSummary || "",
      status: "Referred",
      actionPlan: {
        targetGoals: targetGoals || [],
        academicMilestones: academicMilestones || "",
        supportResourcesAssigned: [],
        followUpDate: followUpDate ? new Date(followUpDate) : undefined
      },
      sessions: [],
      progressRating: "Stable"
    });

    student.counsellingStatus = "Referred";
    await student.save();

    await logAuditEvent(
      req,
      "CREATE_COUNSELLING_REFERRAL",
      "CounsellingReferral",
      referral._id.toString(),
      `Created counselling referral for ${student.name} (${student.student_id}) in category ${category}`
    );

    res.status(201).json({ message: "Referral created successfully", referral });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create referral: ${err.message}` });
  }
};

export const getReferrals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status, urgency, category, studentId } = req.query;

    const query: any = {};

    if (user.role === "student") {
      query.student_id = user.studentRefId;
    } else if (user.role === "faculty") {
      // Faculty sees referrals created by them, or for students in their assigned list
      query.$or = [
        { referredByUserId: user.userId },
        { student_id: { $in: user.assignedStudentIds || [] } }
      ];
    }

    if (studentId) query.student_id = studentId;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (category) query.category = category;

    const referrals = await CounsellingReferral.find(query).sort({ referralDate: -1 });

    res.json({ referrals, count: referrals.length });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch referrals: ${err.message}` });
  }
};

export const getReferralById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { referralId } = req.params;
    const referral = await CounsellingReferral.findById(referralId);

    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }

    res.json({ referral });
  } catch (err: any) {
    res.status(500).json({ error: `Error retrieving referral: ${err.message}` });
  }
};

export const addSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { referralId } = req.params;
    const { notes, interventionsApplied, studentResponse, nextFollowUpDate, status } = req.body;

    const referral = await CounsellingReferral.findById(referralId);
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }

    referral.sessions.push({
      sessionDate: new Date(),
      counsellorName: user.name,
      notes,
      interventionsApplied: interventionsApplied || [],
      studentResponse: studentResponse || "",
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
      status: status || "Conducted"
    });

    referral.status = "In Progress";
    await referral.save();

    await Student.findOneAndUpdate(
      { student_id: referral.student_id },
      { $set: { counsellingStatus: "In Progress" } }
    );

    await logAuditEvent(
      req,
      "ADD_COUNSELLING_SESSION",
      "CounsellingReferral",
      referral._id.toString(),
      `Logged counselling session for student ${referral.student_id}`
    );

    res.json({ message: "Session logged successfully", referral });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to add session: ${err.message}` });
  }
};

export const updateActionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { referralId } = req.params;
    const { targetGoals, academicMilestones, supportResourcesAssigned, followUpDate, progressRating } = req.body;

    const referral = await CounsellingReferral.findById(referralId);
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }

    if (targetGoals) referral.actionPlan.targetGoals = targetGoals;
    if (academicMilestones !== undefined) referral.actionPlan.academicMilestones = academicMilestones;
    if (supportResourcesAssigned) referral.actionPlan.supportResourcesAssigned = supportResourcesAssigned;
    if (followUpDate) referral.actionPlan.followUpDate = new Date(followUpDate);
    if (progressRating) referral.progressRating = progressRating;

    await referral.save();

    res.json({ message: "Action plan updated successfully", referral });
  } catch (err: any) {
    res.status(500).json({ error: `Update failed: ${err.message}` });
  }
};

export const resolveReferral = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { referralId } = req.params;
    const { finalOutcome, progressRating, newStudentStatus } = req.body;

    const referral = await CounsellingReferral.findById(referralId);
    if (!referral) {
      res.status(404).json({ error: "Referral not found" });
      return;
    }

    referral.status = "Resolved";
    referral.finalOutcome = finalOutcome || "Successfully completed counselling intervention plan.";
    referral.progressRating = progressRating || "Resolved";
    referral.resolvedAt = new Date();
    await referral.save();

    await Student.findOneAndUpdate(
      { student_id: referral.student_id },
      { $set: { counsellingStatus: newStudentStatus || "Resolved", requiresHumanReview: false } }
    );

    await logAuditEvent(
      req,
      "RESOLVE_COUNSELLING_CASE",
      "CounsellingReferral",
      referral._id.toString(),
      `Resolved counselling case for ${referral.student_id}: ${referral.finalOutcome}`
    );

    res.json({ message: "Referral case marked as resolved", referral });
  } catch (err: any) {
    res.status(500).json({ error: `Resolve failed: ${err.message}` });
  }
};

