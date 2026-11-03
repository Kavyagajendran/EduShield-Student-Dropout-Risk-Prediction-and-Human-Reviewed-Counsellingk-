import { Router } from "express";
import multer from "multer";
import os from "os";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsCSV
} from "../controllers/studentController";
import { authenticateToken, requireRoles } from "../middleware/auth";
import { enforceStudentAccessScope } from "../middleware/accessControl";

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.use(authenticateToken);

router.get("/", getStudents);
router.get("/:studentId", enforceStudentAccessScope, getStudentById);
router.post("/", requireRoles("admin"), createStudent);
router.put("/:studentId", requireRoles("admin", "faculty"), updateStudent);
router.delete("/:studentId", requireRoles("admin"), deleteStudent);
router.post("/import/csv", requireRoles("admin"), upload.single("file"), importStudentsCSV);

export default router;

