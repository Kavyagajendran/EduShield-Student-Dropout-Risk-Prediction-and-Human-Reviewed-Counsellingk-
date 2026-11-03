import { Response } from "express";
import { Student } from "../models/Student";
import { CounsellingReferral } from "../models/CounsellingReferral";
import { AuthRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";

export const generateInstitutionalReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format = "json", department, riskCategory } = req.query;

    const query: any = {};
    if (department) query.department = department;
    if (riskCategory) query.currentRiskCategory = riskCategory;

    const students = await Student.find(query).sort({ currentRiskProbability: -1 });
    const referrals = await CounsellingReferral.find({});

    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: req.user?.name || "Administrator",
      scope: department ? `Department: ${department}` : "Institution-Wide",
      metrics: {
        totalEvaluated: students.length,
        highRiskCount: students.filter((s) => s.currentRiskCategory === "High").length,
        moderateRiskCount: students.filter((s) => s.currentRiskCategory === "Moderate").length,
        lowRiskCount: students.filter((s) => s.currentRiskCategory === "Low").length,
        flaggedForHumanReview: students.filter((s) => s.requiresHumanReview).length,
        totalActiveCounsellingCases: referrals.filter((r) => r.status !== "Resolved").length,
        totalResolvedCounsellingCases: referrals.filter((r) => r.status === "Resolved").length
      },
      students: students.map((s) => ({
        student_id: s.student_id,
        name: s.name,
        department: s.department,
        semester: s.current_semester,
        gpa: s.gpa_current,
        attendance: s.attendance_rate,
        backlogs: s.backlog_count,
        riskScore: Math.round(s.currentRiskProbability * 100),
        riskCategory: s.currentRiskCategory,
        requiresReview: s.requiresHumanReview,
        counsellingStatus: s.counsellingStatus
      }))
    };

    await logAuditEvent(
      req,
      "GENERATE_REPORT",
      "Report",
      "INSTITUTIONAL",
      `Exported institutional dropout risk report (${format.toString().toUpperCase()})`
    );

    if (format === "csv") {
      let csv = "Student ID,Name,Department,Semester,GPA,Attendance %,Backlogs,Risk Score %,Risk Category,Requires Review,Counselling Status\n";
      report.students.forEach((s) => {
        csv += `"${s.student_id}","${s.name}","${s.department}",${s.semester},${s.gpa},${s.attendance},${s.backlogs},${s.riskScore},"${s.riskCategory}",${s.requiresReview},"${s.counsellingStatus}"\n`;
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=edushield-report-${Date.now()}.csv`);
      res.send(csv);
      return;
    }

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: `Report generation failed: ${err.message}` });
  }
};

