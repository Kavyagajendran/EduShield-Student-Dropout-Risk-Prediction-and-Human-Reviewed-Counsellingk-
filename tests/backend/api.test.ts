import http from "http";
import { AddressInfo } from "net";
import app from "../../backend/src/app";
import { connectDB, disconnectDB } from "../../backend/src/config/db";
import { seedDatabase } from "../../backend/src/scripts/seed";

let server: http.Server;
let baseUrl: string;

let adminToken: string;
let facultyToken: string;
let studentToken: string;

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  // Start app on ephemeral port
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  // Login as admin
  const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@edushield.edu", password: "AdminPass123!" })
  });
  const adminData = await adminRes.json();
  adminToken = adminData.token;

  // Login as faculty
  const facultyRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "faculty.smith@edushield.edu", password: "FacultyPass123!" })
  });
  const facultyData = await facultyRes.json();
  facultyToken = facultyData.token;

  // Login as student
  const studentRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student.alex@edushield.edu", password: "StudentPass123!" })
  });
  const studentData = await studentRes.json();
  studentToken = studentData.token;
}, 60000);

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await disconnectDB();
});

describe("EduShield Backend API Test Suite", () => {
  describe("1. Health & System Status", () => {
    it("should return healthy status for /api/health", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("healthy");
      expect(data.service).toBe("EduShield Backend API");
    });
  });

  describe("2. Authentication & Credential Verification", () => {
    it("should login successfully with valid admin credentials", async () => {
      expect(adminToken).toBeDefined();
    });

    it("should reject login with invalid password", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@edushield.edu", password: "WrongPassword!" })
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Invalid credentials");
    });

    it("should retrieve current user profile with /api/auth/me", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe("admin@edushield.edu");
      expect(data.user.role).toBe("admin");
    });
  });

  describe("3. Student Management & Access Control", () => {
    it("should list students for admin with pagination", async () => {
      const res = await fetch(`${baseUrl}/api/students?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.students.length).toBeGreaterThan(0);
      expect(data.pagination.total).toBeGreaterThanOrEqual(10);
    });

    it("should allow student to access their own record", async () => {
      const res = await fetch(`${baseUrl}/api/students/STU-2026-1000`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.student.student_id).toBe("STU-2026-1000");
    });

    it("should DENY student from accessing another student's record (Resource-level RBAC)", async () => {
      const res = await fetch(`${baseUrl}/api/students/STU-2026-1005`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/Access denied/);
    });

    it("should allow faculty to access an assigned student", async () => {
      const res = await fetch(`${baseUrl}/api/students/STU-2026-1001`, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.student.student_id).toBe("STU-2026-1001");
    });
  });

  describe("4. Human-Reviewed Counselling Workflow", () => {
    let createdReferralId: string;

    it("should allow faculty to create a counselling referral with human review reason", async () => {
      const res = await fetch(`${baseUrl}/api/counselling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${facultyToken}`
        },
        body: JSON.stringify({
          student_id: "STU-2026-1001",
          assignedCounsellor: "Prof. Robert Smith",
          urgency: "High",
          category: "Academic",
          reason: "Student exhibits 3 consecutive missed assignments and backlog risk.",
          shapEvidenceSummary: "TreeSHAP highlights backlog_count (+0.38) and attendance_rate (+0.25).",
          targetGoals: ["Catch up on homework", "Attend academic advising"],
          academicMilestones: "Target term GPA recovery to 2.80"
        })
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.referral.status).toBe("Referred");
      createdReferralId = data.referral._id;
    });

    it("should allow faculty to log a counselling session with intervention notes", async () => {
      const res = await fetch(`${baseUrl}/api/counselling/${createdReferralId}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${facultyToken}`
        },
        body: JSON.stringify({
          notes: "Met with student to discuss backlog coursework. Established peer tutoring roadmap.",
          interventionsApplied: ["Peer Tutoring Assignment", "Academic Study Plan"],
          studentResponse: "Student agreed to weekly tutoring meetings.",
          status: "Conducted"
        })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.referral.status).toBe("In Progress");
      expect(data.referral.sessions.length).toBeGreaterThan(0);
    });

    it("should allow faculty to mark counselling case as resolved with recorded outcome", async () => {
      const res = await fetch(`${baseUrl}/api/counselling/${createdReferralId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${facultyToken}`
        },
        body: JSON.stringify({
          finalOutcome: "Student completed tutoring, restored attendance to 84%, and passed backlog exam.",
          progressRating: "Resolved",
          newStudentStatus: "Resolved"
        })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.referral.status).toBe("Resolved");
      expect(data.referral.progressRating).toBe("Resolved");
    });
  });

  describe("5. Institutional Analytics & Reporting", () => {
    it("should retrieve dashboard analytics summary and distribution bins", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBeDefined();
      expect(data.summary.totalStudents).toBeGreaterThan(0);
      expect(data.departmentDistribution).toBeDefined();
      expect(data.riskDistribution.length).toBe(5);
      expect(data.scatterData.length).toBeGreaterThan(0);
    });

    it("should generate institutional report in JSON format", async () => {
      const res = await fetch(`${baseUrl}/api/reports/institutional?format=json`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics.totalEvaluated).toBeGreaterThan(0);
      expect(data.students.length).toBeGreaterThan(0);
    });

    it("should export institutional report in CSV format", async () => {
      const res = await fetch(`${baseUrl}/api/reports/institutional?format=csv`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/text\/csv/);
      const text = await res.text();
      expect(text).toContain("Student ID,Name,Department");
    });
  });

  describe("6. Audit Logging & Compliance", () => {
    it("should allow admin to inspect audit logs", async () => {
      const res = await fetch(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.logs.length).toBeGreaterThan(0);
    });

    it("should forbid faculty or student from accessing audit logs", async () => {
      const res = await fetch(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });

      expect(res.status).toBe(403);
    });
  });
});
