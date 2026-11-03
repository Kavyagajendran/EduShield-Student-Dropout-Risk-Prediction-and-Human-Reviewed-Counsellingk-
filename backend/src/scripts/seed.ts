import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import csvParser from "csv-parser";
import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { Student } from "../models/Student";
import { CounsellingReferral } from "../models/CounsellingReferral";
import { PredictionRecord } from "../models/PredictionRecord";
import { AuditLog } from "../models/AuditLog";

export const seedDatabase = async () => {
  console.log("Seeding EduShield database...");
  await connectDB();

  // Drop entire database to eliminate any legacy collection indexes
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    console.log("Cleaned database and purged legacy indexes.");
  }

  // 1. Create Default Users
  const adminPassword = await bcrypt.hash("AdminPass123!", 10);
  const facultyPassword = await bcrypt.hash("FacultyPass123!", 10);
  const studentPassword = await bcrypt.hash("StudentPass123!", 10);

  const assignedStudentIds = [
    "STU-2026-1000", "STU-2026-1001", "STU-2026-1002", "STU-2026-1003",
    "STU-2026-1004", "STU-2026-1005", "STU-2026-1006", "STU-2026-1007",
    "STU-2026-1008", "STU-2026-1009", "STU-2026-1010", "STU-2026-1011"
  ];

  const admin = await User.create({
    email: "admin@edushield.edu",
    password: adminPassword,
    name: "Dr. Eleanor Vance",
    role: "admin",
    department: "Academic Administration"
  });

  const faculty = await User.create({
    email: "faculty.smith@edushield.edu",
    password: facultyPassword,
    name: "Prof. Robert Smith",
    role: "faculty",
    department: "Computer Science",
    assignedStudentIds
  });

  const studentUser = await User.create({
    email: "student.alex@edushield.edu",
    password: studentPassword,
    name: "Alex Chen",
    role: "student",
    department: "Computer Science",
    studentRefId: "STU-2026-1000"
  });

  console.log("Created demo users: Admin, Faculty, and Student.");

  // 2. Load and insert students from datasets/student_dropout_dataset.csv
  const csvPath = path.resolve(__dirname, "../../../datasets/student_dropout_dataset.csv");
  const studentRecords: any[] = [];

  if (fs.existsSync(csvPath)) {
    console.log(`Reading dataset from ${csvPath}...`);
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on("data", (row) => {
          const isHighRisk = parseInt(row.dropout_risk, 10) === 1;
          const gpa = parseFloat(row.gpa_current) || 2.5;
          const att = parseFloat(row.attendance_rate) || 75.0;
          const backlogs = parseInt(row.backlog_count, 10) || 0;

          // Compute estimated probability and category
          const riskProb = isHighRisk
            ? Math.min(0.96, Math.max(0.60, 0.55 + 0.12 * backlogs - 0.08 * (gpa - 2.5)))
            : Math.max(0.04, Math.min(0.38, 0.30 - 0.08 * (gpa - 3.0)));

          const category = riskProb >= 0.65 ? "High" : (riskProb >= 0.35 ? "Moderate" : "Low");
          const needsReview = riskProb >= 0.40 || backlogs >= 2 || att < 75;

          studentRecords.push({
            student_id: row.student_id,
            name: row.student_id === "STU-2026-1000" ? "Alex Chen" : `Student ${row.student_id.replace("STU-2026-", "")}`,
            email: row.student_id === "STU-2026-1000" ? "student.alex@edushield.edu" : `${row.student_id.toLowerCase()}@edushield.edu`,
            department: row.department,
            current_semester: parseInt(row.current_semester, 10),
            assignedFacultyEmail: row.department === "Computer Science" ? "faculty.smith@edushield.edu" : "faculty.general@edushield.edu",
            gpa_current: gpa,
            gpa_previous_semester: parseFloat(row.gpa_previous_semester) || 2.5,
            high_school_gpa: parseFloat(row.high_school_gpa) || 3.0,
            credits_completed_ratio: parseFloat(row.credits_completed_ratio) || 0.75,
            attendance_rate: att,
            lab_attendance_rate: parseFloat(row.lab_attendance_rate) || att,
            backlog_count: backlogs,
            repeated_courses_count: parseInt(row.repeated_courses_count, 10) || 0,
            assignment_submission_rate: parseFloat(row.assignment_submission_rate) || 75.0,
            quiz_average_score: parseFloat(row.quiz_average_score) || 70.0,
            lms_logins_per_week: parseInt(row.lms_logins_per_week, 10) || 8,
            forum_participation_count: parseInt(row.forum_participation_count, 10) || 2,
            library_checkouts: parseInt(row.library_checkouts, 10) || 4,
            video_watch_ratio: parseFloat(row.video_watch_ratio) || 0.65,
            study_hours_per_week: parseFloat(row.study_hours_per_week) || 12.0,
            scholarship_recipient: parseInt(row.scholarship_recipient, 10) || 0,
            tuition_fees_up_to_date: parseInt(row.tuition_fees_up_to_date, 10) ?? 1,
            parental_education_level: row.parental_education_level || "Bachelor",
            family_income_bracket: row.family_income_bracket || "Medium",
            stress_level_score: parseInt(row.stress_level_score, 10) || 5,
            sleep_hours_per_day: parseFloat(row.sleep_hours_per_day) || 7.0,
            commute_time_minutes: parseInt(row.commute_time_minutes, 10) || 30,
            social_belonging_score: parseInt(row.social_belonging_score, 10) || 6,
            dropout_risk: parseInt(row.dropout_risk, 10) || 0,
            currentRiskProbability: Math.round(riskProb * 100) / 100,
            currentRiskCategory: category,
            requiresHumanReview: needsReview,
            counsellingStatus: needsReview && isHighRisk ? "Referred" : "None",
            lastEvaluatedAt: new Date()
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    await Student.insertMany(studentRecords);
    console.log(`Inserted ${studentRecords.length} student records into database.`);
  }

  // 3. Create Sample Counselling Cases & Longitudinal Sessions
  const highRiskStudents = await Student.find({ currentRiskCategory: "High" }).limit(5);

  for (let i = 0; i < highRiskStudents.length; i++) {
    const stu = highRiskStudents[i];
    await CounsellingReferral.create({
      student_id: stu.student_id,
      studentName: stu.name,
      referralDate: new Date(Date.now() - (14 - i * 2) * 86400000),
      referredByUserId: faculty._id.toString(),
      referredByName: faculty.name,
      assignedCounsellor: "Prof. Robert Smith",
      urgency: "High",
      category: i % 2 === 0 ? "Academic" : "Attendance",
      reason: `Flagged by EduShield Explainable AI due to high backlog count (${stu.backlog_count}) and lecture attendance (${stu.attendance_rate}%).`,
      shapEvidenceSummary: "TreeSHAP attribution indicates backlog count (+0.42) and attendance deficit (+0.31) as the principal drivers elevating risk.",
      status: i === 0 ? "In Progress" : (i === 1 ? "Resolved" : "Referred"),
      actionPlan: {
        targetGoals: [
          "Complete remedial mentoring in failed subjects",
          "Maintain weekly lecture attendance > 80%",
          "Submit all outstanding lab portfolios"
        ],
        academicMilestones: "Target term GPA recovery to 2.80 with zero repeat backlogs",
        supportResourcesAssigned: ["Departmental Peer Tutoring", "Academic Advisory Cell"],
        followUpDate: new Date(Date.now() + 7 * 86400000)
      },
      sessions: [
        {
          sessionId: `sess-${100 + i}-1`,
          sessionDate: new Date(Date.now() - 10 * 86400000),
          counsellorName: faculty.name,
          notes: "Initial intake interview conducted. Student explained that part-time job commitments affected morning lecture attendance. Established adjusted study schedule.",
          interventionsApplied: ["Course schedule adjustment advice", "Peer tutoring referral"],
          studentResponse: "Receptive and appreciative of non-punitive supportive intervention.",
          nextFollowUpDate: new Date(Date.now() + 7 * 86400000),
          status: "Conducted"
        }
      ],
      progressRating: i === 1 ? "Resolved" : "Improving",
      finalOutcome: i === 1 ? "Successfully restored attendance to 82% and cleared 2 backlogs in re-examinations." : ""
    });
  }

  // 4. Initial Audit Logs
  await AuditLog.create([
    {
      timestamp: new Date(),
      userId: admin._id.toString(),
      userName: admin.name,
      userRole: admin.role,
      action: "DATABASE_INITIALIZATION",
      resourceType: "System",
      details: "EduShield research development database seeded with 500 student records and demo credentials."
    }
  ]);

  console.log("Database successfully seeded!");
};

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding script completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
