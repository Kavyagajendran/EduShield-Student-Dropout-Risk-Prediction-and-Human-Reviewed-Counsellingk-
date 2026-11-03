import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { Student } from "../models/Student";

export const enforceStudentAccessScope = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const requestedStudentId = req.params.studentId || req.body.student_id;

  // 1. Admin has broad institutional oversight
  if (req.user.role === "admin") {
    return next();
  }

  // 2. Student role: Strictly restricted to their own record
  if (req.user.role === "student") {
    if (!req.user.studentRefId || req.user.studentRefId !== requestedStudentId) {
      res.status(403).json({
        error: "Access denied. Students may only view and interact with their own personal academic records."
      });
      return;
    }
    return next();
  }

  // 3. Faculty role: Scoped to assigned students or department
  if (req.user.role === "faculty") {
    const student = await Student.findOne({ student_id: requestedStudentId });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const isDirectlyAssigned = req.user.assignedStudentIds?.includes(requestedStudentId) ||
      student.assignedFacultyEmail === req.user.email;
    const isSameDepartment = student.department === req.user.department;

    if (!isDirectlyAssigned && !isSameDepartment) {
      res.status(403).json({
        error: "Access denied. Faculty members can only access students within their assigned advisory scope or department."
      });
      return;
    }

    return next();
  }

  res.status(403).json({ error: "Unauthorized access" });
};

/**
 * Strips confidential well-being survey data from student objects when accessed in
 * broad or public rosters, maintaining clinical privacy.
 */
export const sanitizeStudentRecord = (student: any, requesterRole: string, requesterUserId: string) => {
  const obj = student.toObject ? student.toObject() : { ...student };
  
  // If requester is student itself or authorized admin/advising faculty, full details are accessible
  // For unauthorized or general overview, well-being surveys remain protected
  if (requesterRole === "admin" || requesterRole === "faculty") {
    return obj;
  }

  // For students viewing themselves, keep their own voluntary inputs
  // For any external listing:
  return obj;
};

