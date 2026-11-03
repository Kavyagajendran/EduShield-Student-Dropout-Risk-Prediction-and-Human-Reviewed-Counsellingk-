import { Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import { Student } from "../models/Student";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";
import { MLServiceClient } from "../services/mlService";

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      page = 1,
      limit = 20,
      search = "",
      department = "",
      riskCategory = "",
      requiresReview = "",
      sortBy = "currentRiskProbability",
      sortOrder = "desc"
    } = req.query;

    const query: any = {};

    // Role-based scope enforcement
    if (user.role === "student") {
      query.student_id = user.studentRefId;
    } else if (user.role === "faculty") {
      query.$or = [
        { assignedFacultyEmail: user.email },
        { department: user.department },
        { student_id: { $in: user.assignedStudentIds || [] } }
      ];
    }

    // Filters
    if (search) {
      const searchRegex = new RegExp(String(search), "i");
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: searchRegex },
          { student_id: searchRegex },
          { email: searchRegex }
        ]
      });
    }

    if (department) {
      query.department = department;
    }

    if (riskCategory) {
      query.currentRiskCategory = riskCategory;
    }

    if (requiresReview === "true") {
      query.requiresHumanReview = true;
    } else if (requiresReview === "false") {
      query.requiresHumanReview = false;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * pageSize;

    const sortDir = sortOrder === "asc" ? 1 : -1;
    const sortObj: any = { [String(sortBy)]: sortDir };

    const [students, total] = await Promise.all([
      Student.find(query).sort(sortObj).skip(skip).limit(pageSize),
      Student.countDocuments(query)
    ]);

    res.json({
      students,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to retrieve students: ${err.message}` });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ student_id: studentId });

    if (!student) {
      res.status(404).json({ error: `Student with ID ${studentId} not found` });
      return;
    }

    await logAuditEvent(
      req,
      "VIEW_STUDENT_PROFILE",
      "Student",
      student.student_id,
      `Viewed student risk profile for ${student.name} (${student.student_id})`
    );

    res.json({ student });
  } catch (err: any) {
    res.status(500).json({ error: `Error fetching student: ${err.message}` });
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentData = req.body;
    const existing = await Student.findOne({ student_id: studentData.student_id });
    if (existing) {
      res.status(409).json({ error: `Student ID ${studentData.student_id} already exists` });
      return;
    }

    // Predict risk immediately using ML service
    try {
      const mlResult = await MLServiceClient.predictStudent(studentData);
      studentData.currentRiskProbability = mlResult.dropout_risk_probability;
      studentData.currentRiskCategory = mlResult.risk_category;
      studentData.requiresHumanReview = mlResult.requires_human_review;
      studentData.lastEvaluatedAt = new Date();
    } catch (mlErr) {
      console.warn("ML Service unavailable during student creation; setting defaults:", mlErr);
      studentData.currentRiskProbability = 0.5;
      studentData.currentRiskCategory = "Moderate";
      studentData.requiresHumanReview = true;
    }

    const student = await Student.create(studentData);

    await logAuditEvent(
      req,
      "CREATE_STUDENT",
      "Student",
      student.student_id,
      `Created student record for ${student.name}`
    );

    res.status(201).json({ message: "Student created successfully", student });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to create student: ${err.message}` });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    const student = await Student.findOneAndUpdate(
      { student_id: studentId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    await logAuditEvent(
      req,
      "UPDATE_STUDENT",
      "Student",
      student.student_id,
      `Updated profile/academic metrics for ${student.name}`
    );

    res.json({ message: "Student updated successfully", student });
  } catch (err: any) {
    res.status(500).json({ error: `Update failed: ${err.message}` });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const deleted = await Student.findOneAndDelete({ student_id: studentId });

    if (!deleted) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    await logAuditEvent(
      req,
      "DELETE_STUDENT",
      "Student",
      String(studentId),
      `Deleted student record ${studentId}`
    );

    res.json({ message: `Student ${studentId} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ error: `Delete failed: ${err.message}` });
  }
};

export const importStudentsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No CSV file uploaded" });
      return;
    }

    const filePath = req.file.path;
    const records: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // Parse numerical fields
        records.push({
          student_id: row.student_id || `STU-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: row.name || `Student ${row.student_id}`,
          email: row.email || `${row.student_id?.toLowerCase()}@edushield.edu`,
          department: row.department || "Computer Science",
          current_semester: parseInt(row.current_semester, 10) || 1,
          gpa_current: parseFloat(row.gpa_current) || 2.5,
          gpa_previous_semester: parseFloat(row.gpa_previous_semester) || 2.5,
          high_school_gpa: parseFloat(row.high_school_gpa) || 3.0,
          credits_completed_ratio: parseFloat(row.credits_completed_ratio) || 0.75,
          attendance_rate: parseFloat(row.attendance_rate) || 75.0,
          lab_attendance_rate: parseFloat(row.lab_attendance_rate) || 75.0,
          backlog_count: parseInt(row.backlog_count, 10) || 0,
          repeated_courses_count: parseInt(row.repeated_courses_count, 10) || 0,
          assignment_submission_rate: parseFloat(row.assignment_submission_rate) || 80.0,
          quiz_average_score: parseFloat(row.quiz_average_score) || 75.0,
          lms_logins_per_week: parseInt(row.lms_logins_per_week, 10) || 10,
          forum_participation_count: parseInt(row.forum_participation_count, 10) || 2,
          library_checkouts: parseInt(row.library_checkouts, 10) || 3,
          video_watch_ratio: parseFloat(row.video_watch_ratio) || 0.7,
          study_hours_per_week: parseFloat(row.study_hours_per_week) || 12.0,
          scholarship_recipient: parseInt(row.scholarship_recipient, 10) || 0,
          tuition_fees_up_to_date: parseInt(row.tuition_fees_up_to_date, 10) ?? 1,
          parental_education_level: row.parental_education_level || "Bachelor",
          family_income_bracket: row.family_income_bracket || "Medium",
          stress_level_score: parseInt(row.stress_level_score, 10) || 5,
          sleep_hours_per_day: parseFloat(row.sleep_hours_per_day) || 7.0,
          commute_time_minutes: parseInt(row.commute_time_minutes, 10) || 30,
          social_belonging_score: parseInt(row.social_belonging_score, 10) || 6,
          dropout_risk: parseInt(row.dropout_risk, 10) || 0
        });
      })
      .on("end", async () => {
        try {
          fs.unlinkSync(filePath); // Cleanup temp file

          let importedCount = 0;
          for (const item of records) {
            await Student.findOneAndUpdate(
              { student_id: item.student_id },
              { $set: item },
              { upsert: true, new: true }
            );
            importedCount++;
          }

          await logAuditEvent(
            req,
            "CSV_IMPORT",
            "Student",
            "BATCH",
            `Imported ${importedCount} student records via CSV upload`
          );

          res.json({
            message: `Successfully processed and imported ${importedCount} student records.`,
            importedCount
          });
        } catch (dbErr: any) {
          res.status(500).json({ error: `Database error during import: ${dbErr.message}` });
        }
      })
      .on("error", (err) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: `CSV parsing failed: ${err.message}` });
      });
  } catch (err: any) {
    res.status(500).json({ error: `Import failed: ${err.message}` });
  }
};
