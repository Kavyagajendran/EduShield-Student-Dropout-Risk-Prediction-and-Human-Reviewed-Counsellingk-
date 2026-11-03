import { Response } from "express";
import { Student } from "../models/Student";
import { CounsellingReferral } from "../models/CounsellingReferral";
import { AuthRequest } from "../middleware/auth";

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const filter: any = {};

    if (user.role === "faculty") {
      filter.$or = [
        { assignedFacultyEmail: user.email },
        { department: user.department },
        { student_id: { $in: user.assignedStudentIds || [] } }
      ];
    } else if (user.role === "student") {
      filter.student_id = user.studentRefId;
    }

    const [
      totalStudents,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      requiresReviewCount,
      activeReferralsCount,
      departmentStats,
      allStudents
    ] = await Promise.all([
      Student.countDocuments(filter),
      Student.countDocuments({ ...filter, currentRiskCategory: "High" }),
      Student.countDocuments({ ...filter, currentRiskCategory: "Moderate" }),
      Student.countDocuments({ ...filter, currentRiskCategory: "Low" }),
      Student.countDocuments({ ...filter, requiresHumanReview: true }),
      CounsellingReferral.countDocuments(
        user.role === "student"
          ? { student_id: user.studentRefId, status: { $in: ["Referred", "In Progress", "Scheduled"] } }
          : { status: { $in: ["Referred", "In Progress", "Scheduled"] } }
      ),
      Student.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            avgGpa: { $avg: "$gpa_current" },
            avgAttendance: { $avg: "$attendance_rate" },
            highRisk: {
              $sum: { $cond: [{ $eq: ["$currentRiskCategory", "High"] }, 1, 0] }
            },
            moderateRisk: {
              $sum: { $cond: [{ $eq: ["$currentRiskCategory", "Moderate"] }, 1, 0] }
            },
            lowRisk: {
              $sum: { $cond: [{ $eq: ["$currentRiskCategory", "Low"] }, 1, 0] }
            }
          }
        },
        { $sort: { total: -1 } }
      ]),
      Student.find(filter)
        .select("student_id name department gpa_current attendance_rate backlog_count currentRiskProbability currentRiskCategory requiresHumanReview")
        .limit(100)
    ]);

    // Risk probability distribution bins
    const riskBins = [
      { bin: "0-20%", count: 0, label: "Very Low" },
      { bin: "20-40%", count: 0, label: "Low" },
      { bin: "40-60%", count: 0, label: "Moderate" },
      { bin: "60-80%", count: 0, label: "Elevated" },
      { bin: "80-100%", count: 0, label: "Critical" }
    ];

    allStudents.forEach((s) => {
      const prob = s.currentRiskProbability;
      if (prob < 0.2) riskBins[0].count++;
      else if (prob < 0.4) riskBins[1].count++;
      else if (prob < 0.6) riskBins[2].count++;
      else if (prob < 0.8) riskBins[3].count++;
      else riskBins[4].count++;
    });

    // Scatter plot samples (Attendance vs GPA vs Risk)
    const scatterData = allStudents.map((s) => ({
      student_id: s.student_id,
      name: s.name,
      gpa: s.gpa_current,
      attendance: s.attendance_rate,
      backlogs: s.backlog_count,
      riskProbability: Math.round(s.currentRiskProbability * 100),
      riskCategory: s.currentRiskCategory
    }));

    res.json({
      summary: {
        totalStudents,
        highRiskCount,
        moderateRiskCount,
        lowRiskCount,
        requiresReviewCount,
        activeReferralsCount,
        highRiskPercentage: totalStudents ? Math.round((highRiskCount / totalStudents) * 100) : 0
      },
      departmentDistribution: departmentStats.map((d) => ({
        department: d._id,
        total: d.total,
        avgGpa: Math.round(d.avgGpa * 100) / 100,
        avgAttendance: Math.round(d.avgAttendance * 10) / 10,
        highRisk: d.highRisk,
        moderateRisk: d.moderateRisk,
        lowRisk: d.lowRisk
      })),
      riskDistribution: riskBins,
      scatterData
    });
  } catch (err: any) {
    res.status(500).json({ error: `Analytics failed: ${err.message}` });
  }
};

